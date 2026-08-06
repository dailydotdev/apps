/**
 * Whether the world is being read on a handheld.
 *
 * Both halves of the test carry weight. The width is the same line the overlay
 * lays itself out on (`ViewSize.Laptop`, min-width 1020px), so the chrome and
 * the renderer never disagree about which world this is. The pointer is what
 * separates a phone from a narrow desktop window: one has a mobile GPU and a
 * thermal budget, the other has neither problem and should keep everything.
 *
 * Read ONCE per mount rather than subscribed to. The renderer's quality tier is
 * fixed when its WebGL context is created and the growth log is either fetched
 * or it is not; a world that changed its mind on rotate would have to tear both
 * down and raise them again, which is the reader's place taken away from them
 * for turning their phone sideways.
 */
export const isHandheld = (): boolean =>
  !!globalThis.matchMedia?.('(pointer: coarse) and (max-width: 1019px)')
    .matches;
