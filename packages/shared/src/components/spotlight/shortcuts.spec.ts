import { shouldHandleSpotlightShortcut } from './shortcuts';

const createEvent = (options: KeyboardEventInit = {}): KeyboardEvent =>
  new KeyboardEvent('keydown', {
    key: 'k',
    cancelable: true,
    metaKey: true,
    ...options,
  });

describe('shouldHandleSpotlightShortcut', () => {
  it('handles the spotlight shortcut when it is available', () => {
    expect(
      shouldHandleSpotlightShortcut({
        event: createEvent(),
        isShortcutDisabled: false,
      }),
    ).toBe(true);
  });

  it('does not handle unrelated key presses', () => {
    expect(
      shouldHandleSpotlightShortcut({
        event: createEvent({ key: 'j' }),
        isShortcutDisabled: false,
      }),
    ).toBe(false);
  });

  it('does not handle a disabled spotlight shortcut', () => {
    expect(
      shouldHandleSpotlightShortcut({
        event: createEvent(),
        isShortcutDisabled: true,
      }),
    ).toBe(false);
  });

  it('does not handle events already handled by focused controls', () => {
    const event = createEvent();
    event.preventDefault();

    expect(
      shouldHandleSpotlightShortcut({
        event,
        isShortcutDisabled: false,
      }),
    ).toBe(false);
  });
});
