import type { KeyboardEvent } from 'react';

// Phone keyboards have no Shift+Enter, so on touch screens Enter adds a new
// line and the send/save button sends, like most mobile chat apps.
const isTouchPrimary = (): boolean =>
  globalThis.matchMedia?.('(pointer: coarse)').matches ?? false;

export const isSubmitEnter = (event: KeyboardEvent<HTMLElement>): boolean =>
  event.key === 'Enter' &&
  !event.shiftKey &&
  !event.nativeEvent.isComposing &&
  !isTouchPrimary();
