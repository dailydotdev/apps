/**
 * The new tab page shares a keyboard with Chrome's address bar. On a fresh tab
 * the omnibox holds the caret while this page renders, and the user can click
 * back into it at any moment. `document.hasFocus()` is false in exactly those
 * moments: the tab is visible and painted, but the keyboard belongs to browser
 * chrome, not to us.
 *
 * A programmatic `focus()` made in that state does not "restore" anything — it
 * drags the caret out of the address bar and into the page, so the next thing
 * the user types goes nowhere. From their side the address bar simply stops
 * accepting input until something resets whatever is doing the pulling.
 *
 * Nothing on this page needs to focus an element while the page itself is
 * unfocused, but several dependencies do it as a side effect of their own focus
 * bookkeeping. react-modal is the clearest: its scoped-focus helper arms a flag
 * on every window `blur` (which is what clicking the address bar is) and then
 * pulls focus into the modal element on the next focus event in the document.
 * It also never removes its `focus` listener — it is registered in the capture
 * phase and removed without the capture flag — and its teardown is skipped
 * entirely when a modal unmounts before its open state commits, which leaves
 * that pull armed with no modal on screen. Radix focus scopes and the embedded
 * ad measurement frames have their own variants of the same move. That is why
 * the symptom is intermittent, survives across interactions, and clears as soon
 * as a real modal is opened and closed (react-modal's teardown finally runs).
 *
 * Rather than chase each one, refuse the whole move: drop programmatic focus
 * while the document does not have focus. User gestures are unaffected —
 * clicking or tabbing into the page hands focus over before any handler runs,
 * so `hasFocus()` is already true by then.
 */

let isInstalled = false;

const logBlockedFocus = (target: unknown): void => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // eslint-disable-next-line no-console
  console.warn(
    '[newtab] blocked a focus() call made while the page was unfocused — ' +
      'it would have stolen the caret from the address bar.',
    target,
    new Error().stack,
  );
};

export const preventFocusSteal = (): void => {
  if (isInstalled || typeof HTMLElement === 'undefined') {
    return;
  }

  isInstalled = true;

  const original = HTMLElement.prototype.focus;

  HTMLElement.prototype.focus = function guardedFocus(
    this: HTMLElement,
    options?: FocusOptions,
  ): void {
    if (!document.hasFocus()) {
      logBlockedFocus(this);
      return;
    }

    original.call(this, options);
  };
};
