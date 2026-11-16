import { atom, read, update } from 'claude-code'
import type { Register, Timer } from 'claude-code'

// Absolute PNG paths in a reply's text; the match stops at ".png", so trailing punctuation is left out.
const PNG_PATH = /(\/[^\s`'"()<>\[\]]+\.png)\b/gi
const MAX_IMAGES_PER_MESSAGE = 3
const MAX_COLUMNS = 80
const MAX_ROWS = 30
// Longest side of the copy sent to the terminal: about what MAX_COLUMNS cells can show.
const THUMB_MAX_PX = 480
// The Image element takes at most 2 MiB of decoded PNG bytes.
const MAX_BYTES = 2 * 1024 * 1024
// Scrolling redraws often; look a file up on disk at most this often.
const RECHECK_MS = 5000
// How long the view must be still before pictures draw again.
const SETTLE_MS = 300

// The runtime has Uint8Array.fromBase64 (ES2025); the es2023 lib does not declare it.
declare global {
  interface Uint8ArrayConstructor {
    fromBase64(base64: string): Uint8Array
  }
}

type Picture = { file: string; png: string; width: number; height: number }
type Entry = { mtimeMs: number; checkedAt: number; picture: Picture | null }

const pictures = new Map<string, Entry>()
// Cropped copies by file and hidden rows; null when cropping failed.
const crops = new Map<string, Picture | null>()

const isScrolling = atom({ plugin: 'inline-images', key: 'isScrolling' } as const, false, {
  shape: 'scrolling-1',
})
// The last on-screen extent seen per message: a change means the view scrolled.
const lastSeen = new Map<string, string>()
let settleTimer: Timer | undefined
// A private (0700), randomly named folder for shrunk and cropped copies, made once per load
// with mktemp under the user's own temp directory: never a shared, predictable /tmp path.
let workDir: Promise<string | undefined> | undefined

function pngSize(base64: string): { width: number; height: number } | undefined {
  const head = Uint8Array.fromBase64(base64.slice(0, 32))
  if (head.length < 24 || head[1] !== 0x50 || head[2] !== 0x4e || head[3] !== 0x47) return undefined
  const view = new DataView(head.buffer, head.byteOffset, head.byteLength)
  return { width: view.getUint32(16), height: view.getUint32(20) }
}

function hash(text: string): string {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return (h >>> 0).toString(16)
}

// Terminal cells are about twice as tall as wide; fit the picture in the box keeping its shape.
function cells(picture: Picture, available: number): { columns: number; rows: number } {
  let columns = Math.min(MAX_COLUMNS, Math.max(10, available))
  let rows = Math.round((columns * picture.height) / picture.width / 2)
  if (rows > MAX_ROWS) {
    rows = MAX_ROWS
    columns = Math.round((rows * 2 * picture.width) / picture.height)
  }
  return { columns: Math.max(1, Math.min(255, columns)), rows: Math.max(1, Math.min(255, rows)) }
}

export const register: Register = on => {
  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    const message = await next(e)
    const elements = $.ui.resolve(e)
    if (e.props.isSummary || !('Image' in elements)) return message

    const paths = [...new Set([...e.props.text.matchAll(PNG_PATH)].map(match => match[1]!))].slice(
      0,
      MAX_IMAGES_PER_MESSAGE,
    )
    if (paths.length === 0) return message

    const ensureWorkDir = (): Promise<string | undefined> =>
      (workDir ??= $.process
        .run(['mktemp', '-d', '-t', 'inline-images'])
        .then(made => (made.exitCode === 0 ? made.stdout.trim() || undefined : undefined))
        .catch(() => undefined))

    const readPicture = async (file: string): Promise<Picture | null> => {
      const stat = await $.fs.stat(file)
      if (stat.size > MAX_BYTES) return null
      const { base64 } = await $.fs.read(file, { as: 'bytes' })
      const size = pngSize(base64)
      return size ? { file, png: base64, ...size } : null
    }

    // A smaller copy made once per file version with macOS `sips`; the original when that fails.
    const loadThumb = async (path: string, mtimeMs: number): Promise<Picture | null> => {
      const dir = await ensureWorkDir()
      if (!dir) return readPicture(path)
      const thumb = `${dir}/${hash(path)}-${mtimeMs}.png`
      try {
        const made = await $.process.run(['sips', '-Z', String(THUMB_MAX_PX), path, '--out', thumb])
        if (made.exitCode === 0) return await readPicture(thumb)
      } catch {
        // No sips here: send the original.
      }
      return readPicture(path)
    }

    // The terminal skips a picture whose top row is above the screen, so a picture
    // scrolled partly off the top is drawn as a copy cut to its visible rows (ImageMagick).
    const loadCrop = async (picture: Picture, hidden: number, rows: number): Promise<Picture | null> => {
      const key = `${picture.file}:${hidden}/${rows}`
      if (crops.has(key)) return crops.get(key) ?? null
      const offset = Math.round((picture.height * hidden) / rows)
      const dir = await ensureWorkDir()
      let cropped: Picture | null = null
      if (!dir) {
        crops.set(key, cropped)
        return cropped
      }
      const out = `${dir}/${hash(picture.file)}-top${hidden}of${rows}.png`
      try {
        const made = await $.process.run([
          'magick', picture.file, '-crop', `${picture.width}x${picture.height - offset}+0+${offset}`,
          '+repage', out,
        ])
        if (made.exitCode === 0) cropped = await readPicture(out)
      } catch {
        // No ImageMagick: the picture stays hidden until its top is on screen.
      }
      crops.set(key, cropped)
      return cropped
    }

    const found: { path: string; picture: Picture }[] = []
    const now = Date.now()
    for (const path of paths) {
      try {
        let entry = pictures.get(path)
        if (!entry || now - entry.checkedAt > RECHECK_MS) {
          const { mtimeMs } = await $.fs.stat(path)
          entry =
            entry && entry.mtimeMs === mtimeMs
              ? { ...entry, checkedAt: now }
              : { mtimeMs, checkedAt: now, picture: await loadThumb(path, mtimeMs) }
          pictures.set(path, entry)
        }
        if (entry.picture) found.push({ path, picture: entry.picture })
      } catch {
        // Missing or unreadable: the message draws as it would without the mod.
      }
    }
    if (found.length === 0) return message

    // Every scroll step redraws messages at the viewport's edge and resends their images.
    // While scrolling, a same-sized box holds each picture's place; the pictures draw
    // once the view has been still for SETTLE_MS. Every message with pictures reads
    // `isScrolling`, so flipping it redraws them all.
    const onScreen = e.props.onScreen
    const seen = onScreen === undefined ? undefined : JSON.stringify(onScreen)
    const previous = lastSeen.get(e.requestId)
    if (seen !== undefined) lastSeen.set(e.requestId, seen)
    const hasScrolled = previous !== undefined && seen !== previous
    const wasScrolling = await read($, isScrolling)
    if (hasScrolled) {
      // Drawing may not write state: timers flip the flag just outside this draw.
      settleTimer?.cancel()
      if (!wasScrolling) $.clock.after(0, () => void update($, isScrolling, () => true))
      settleTimer = $.clock.after(SETTLE_MS, () => void update($, isScrolling, () => false))
    }
    const isStill = !hasScrolled && !wasScrolling

    const { Box, Image, Text } = elements
    const available = (e.viewport?.columns ?? 80) - 4
    // Rows of this message above the viewport (its tree starts at row 0).
    const rowsAbove = onScreen ? onScreen.first : 0

    const drawn = []
    let top = 0
    for (const { path, picture } of found) {
      const { columns, rows } = cells(picture, available)
      const hidden = Math.min(rows, Math.max(0, rowsAbove - top))
      top += rows

      if (!isStill) {
        drawn.push(
          <Box width={columns} height={rows}>
            <Text dimColor>{path}</Text>
          </Box>,
        )
      } else if (hidden === 0) {
        drawn.push(<Image key={path} source={{ png: picture.png }} alt={path} columns={columns} rows={rows} />)
      } else {
        const cropped = hidden < rows ? await loadCrop(picture, hidden, rows) : null
        drawn.push(<Box width={columns} height={hidden} />)
        if (hidden < rows) {
          drawn.push(
            cropped ? (
              <Image key={path} source={{ png: cropped.png }} alt={path} columns={columns} rows={rows - hidden} />
            ) : (
              <Box width={columns} height={rows - hidden} />
            ),
          )
        }
      }
    }

    return (
      <Box flexDirection="column">
        {drawn}
        {message}
      </Box>
    )
  })
}
