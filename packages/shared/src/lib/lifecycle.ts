/* eslint-disable no-underscore-dangle, max-classes-per-file */

const ACTIVE = 'active';
const PASSIVE = 'passive';
const HIDDEN = 'hidden';
const FROZEN = 'frozen';
// const DISCARDED = 'discarded'; Not used but show to completeness.
const TERMINATED = 'terminated';

/**
 * Converts an array of states into an object where the state is the key
 * and the value is the index.
 * @param {!Array<string>} arr
 * @return {!Object}
 */
const toIndexedObject = (arr) =>
  arr.reduce((acc, val, idx) => {
    acc[val] = idx;
    return acc;
  }, {});

/**
 * @type {!Array<!Object>}
 */
const LEGAL_STATE_TRANSITIONS = [
  // The normal unload process (bfcache process is addressed above).
  [ACTIVE, PASSIVE, HIDDEN, TERMINATED],

  // An active page transitioning to frozen,
  // or an unloading page going into the bfcache.
  [ACTIVE, PASSIVE, HIDDEN, FROZEN],

  // A hidden page transitioning back to active.
  [HIDDEN, PASSIVE, ACTIVE],

  // A frozen page being resumed
  [FROZEN, HIDDEN],

  // A frozen (bfcached) page navigated back to
  // Note: [FROZEN, HIDDEN] can happen here, but it's already covered above.
  [FROZEN, ACTIVE],
  [FROZEN, PASSIVE],
].map(toIndexedObject);

/**
 * Accepts a current state and a future state and returns an array of legal
 * state transition paths. This is needed to normalize behavior across browsers
 * since some browsers do not fire events in certain cases and thus skip
 * states.
 * @param {string} oldState
 * @param {string} newState
 * @return {!Array<string>}
 */
const getLegalStateTransitionPath = (oldState, newState) => {
  // We're intentionally not using for...of here so when we transpile to ES5
  // we don't need to include the Symbol polyfills.
  for (let order, i = 0; i < LEGAL_STATE_TRANSITIONS.length; i += 1) {
    order = LEGAL_STATE_TRANSITIONS[i];
    const oldIndex = order[oldState];
    const newIndex = order[newState];

    if (oldIndex >= 0 && newIndex >= 0 && newIndex > oldIndex) {
      // Differences greater than one should be reported
      // because it means a state was skipped.
      return Object.keys(order).slice(oldIndex, newIndex + 1);
    }
  }
  return [];
  // TODO(philipwalton): it shouldn't be possible to get here, but
  // consider some kind of warning or call to action if it happens.
  // console.warn(`Invalid state change detected: ${oldState} > ${newState}`);
};

let wasActive = false;

/**
 * Returns the current state based on the document's visibility and
 * in input focus states. Note this method is only used to determine
 * active vs passive vs hidden states, as other states require listening
 * for events.
 * @return {string}
 */
const getInternalLifecycleState = (): string => {
  if (document.visibilityState === HIDDEN) {
    return HIDDEN;
  }
  if (document.hasFocus()) {
    return ACTIVE;
  }
  return PASSIVE;
};

export const getCurrentLifecycleState = (): string => {
  if (wasActive) {
    return ACTIVE;
  }
  return getInternalLifecycleState();
};

export default function listenToLifecycleEvents(): void {
  // Detect Safari to work around Safari-specific bugs.
  const IS_SAFARI = !!window.safari?.pushNotification;

  const SUPPORTS_PAGE_TRANSITION_EVENTS = 'onpageshow' in document.body;

  const EVENTS = [
    'focus',
    'blur',
    'visibilitychange',
    'freeze',
    'resume',
    'pageshow',
    // IE9-10 do not support the pagehide event, so we fall back to unload
    // Note: unload *MUST ONLY* be added conditionally, otherwise it will
    // prevent page navigation caching (a.k.a bfcache).
    SUPPORTS_PAGE_TRANSITION_EVENTS ? 'pagehide' : 'unload',
  ];

  let state = getInternalLifecycleState();
  let safariBeforeUnloadTimeout: number;
  if (state === ACTIVE) {
    wasActive = true;
  }

  const dispatchChangesIfNeeded = (
    originalEvent: Event,
    newState: string,
  ): void => {
    if (newState === PASSIVE && wasActive) {
      // eslint-disable-next-line no-param-reassign
      newState = ACTIVE;
    }
    if (newState !== state) {
      const oldState = state;
      const path = getLegalStateTransitionPath(oldState, newState);

      for (let i = 0; i < path.length - 1; i += 1) {
        const oldPathState = path[i];
        const newPathState = path[i + 1];

        state = newState;
        if (state === ACTIVE) {
          wasActive = true;
        }

        window.dispatchEvent(
          new CustomEvent('statechange', {
            bubbles: true,
            detail: {
              oldState: oldPathState,
              newState: newPathState,
              originalEvent,
            },
          }),
        );
      }
    }
  };

  const handleEvents = (evt: Event): void => {
    if (IS_SAFARI) {
      clearTimeout(safariBeforeUnloadTimeout);
    }

    // eslint-disable-next-line default-case
    switch (evt.type) {
      case 'pageshow':
      case 'resume':
        dispatchChangesIfNeeded(evt, getCurrentLifecycleState());
        break;
      case 'focus':
        if (wasActive) {
          dispatchChangesIfNeeded(evt, ACTIVE);
        }
        break;
      case 'scroll':
      case 'mousedown':
      case 'touchstart':
        dispatchChangesIfNeeded(evt, ACTIVE);
        break;
      case 'blur':
        // The `blur` event can fire while the page is being unloaded, so we
        // only need to update the state if the current state is "active".
        if (state === ACTIVE) {
          dispatchChangesIfNeeded(evt, getInternalLifecycleState());
        }
        break;
      case 'pagehide':
      case 'unload':
        dispatchChangesIfNeeded(
          evt,
          (evt as PageTransitionEvent).persisted ? FROZEN : TERMINATED,
        );
        break;
      case 'visibilitychange':
        // The document's `visibilityState` will change to hidden  as the page
        // is being unloaded, but in such cases the lifecycle state shouldn't
        // change.
        if (state !== FROZEN && state !== TERMINATED) {
          dispatchChangesIfNeeded(evt, getInternalLifecycleState());
        }
        break;
      case 'freeze':
        dispatchChangesIfNeeded(evt, FROZEN);
        break;
    }
  };

  // Add capturing events on window so they run immediately.
  EVENTS.forEach((evt) => window.addEventListener(evt, handleEvents, true));
  ['scroll', 'mousedown', 'touchstart'].forEach((evt) =>
    window.addEventListener(evt, handleEvents, {
      capture: true,
      once: true,
      passive: true,
    }),
  );

  // Safari does not reliably fire the `pagehide` or `visibilitychange`
  // events when closing a tab, so we have to use `beforeunload` with a
  // timeout to check whether the default action was prevented.
  // - https://bugs.webkit.org/show_bug.cgi?id=151610
  // - https://bugs.webkit.org/show_bug.cgi?id=151234
  // NOTE: we only add this to Safari because adding it to Firefox would
  // prevent the page from being eligible for bfcache.
  if (IS_SAFARI) {
    window.addEventListener('beforeunload', (evt) => {
      safariBeforeUnloadTimeout = window.setTimeout(() => {
        if (!(evt.defaultPrevented || evt.returnValue.length > 0)) {
          dispatchChangesIfNeeded(evt, HIDDEN);
        }
      }, 0);
    });
  }
}
