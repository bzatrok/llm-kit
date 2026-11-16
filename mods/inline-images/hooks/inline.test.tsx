import { expect, mock, test } from 'claude-code/testing'

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAGCAIAAABrW6giAAAAEElEQVR4nGP438AARwyUcgCQ2SPpPqIhBwAAAABJRU5ErkJggg=='

const MESSAGE = {
  plugin: 'inline-images',
  component: 'AssistantMessage',
  requestId: 'm1',
  props: { text: 'Saved to /tmp/poster.png.', isFirstOfReply: true },
} as const

test('a reply naming a PNG draws the image above it', async ($, on) => {
  on('fs.stat', () => ({ value: { kind: 'file', isLink: false, size: 100, mtimeMs: 1 } }))
  on('fs.read', () => ({ value: { base64: PNG } }))
  on('process.run', () => ({ value: { exitCode: 1, stdout: '', stderr: 'no sips', isStdoutTruncated: false, isStderrTruncated: false } }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>the reply</Text>
  })

  const ui = await $.ui.mount({ ...MESSAGE, surface: 'terminal' })
  const image = await ui.find({ type: 'Image' })
  expect(image).toBeTruthy()
  expect((await ui.find({ type: 'Text', text: /the reply/ }))?.text).toBe('the reply')
  await ui.unmount()
})

test('while the view scrolls, a placeholder holds the picture place', async ($, on) => {
  const clock = mock.clock(on)
  on('fs.stat', () => ({ value: { kind: 'file', isLink: false, size: 100, mtimeMs: 2 } }))
  on('fs.read', () => ({ value: { base64: PNG } }))
  on('process.run', () => ({ value: { exitCode: 1, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>the reply</Text>
  })
  // Scrolling at the bottom edge: the picture's top stays on screen.
  const at = (last: number) => ({
    ...MESSAGE,
    requestId: 'm2',
    props: { text: 'See /tmp/cut.png', isFirstOfReply: true, onScreen: { first: 0, last, of: 60 } },
    surface: 'terminal' as const,
  })

  const still = await $.ui.mount(at(20))
  expect(await still.find({ type: 'Image' })).toBeTruthy()
  await still.unmount()

  const scrolled = await $.ui.mount(at(23))
  expect(await scrolled.find({ type: 'Image' })).toBeFalsy()
  expect((await scrolled.find({ type: 'Text', text: /cut\.png/ }))?.text).toBe('/tmp/cut.png')
  await scrolled.unmount()

  await clock.advance(400)
  const settled = await $.ui.mount(at(23))
  expect(await settled.find({ type: 'Image' })).toBeTruthy()
  await settled.unmount()
})

test('a picture scrolled partly off the top draws a cropped copy of its visible rows', async ($, on) => {
  on('fs.stat', () => ({ value: { kind: 'file', isLink: false, size: 100, mtimeMs: 3 } }))
  on('fs.read', () => ({ value: { base64: PNG } }))
  // mktemp answers its folder on stdout; sips and magick ignore it.
  on('process.run', () => ({ value: { exitCode: 0, stdout: '/private-dir\n', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>the reply</Text>
  })

  const ui = await $.ui.mount({
    ...MESSAGE,
    requestId: 'm3',
    props: { text: 'See /tmp/top.png', isFirstOfReply: true, onScreen: { first: 4, last: 30, of: 60 } },
    surface: 'terminal',
  })
  const image = await ui.find({ type: 'Image' })
  expect(image).toBeTruthy()
  // 4 columns x 6 px picture at 80 columns is 60 rows, capped at 30; 4 are above the screen.
  expect((image?.props as { rows?: number } | undefined)?.rows).toBe(26)
  await ui.unmount()
})
