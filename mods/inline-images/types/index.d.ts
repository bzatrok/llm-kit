// True from a scroll step until the view has been still for a moment.
export type Scrolling = boolean

declare module 'claude-code' {
  interface PluginState {
    'inline-images': { isScrolling: Shaped<Scrolling> }
  }
}
