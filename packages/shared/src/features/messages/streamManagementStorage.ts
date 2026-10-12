import type { SMState, SMStorageBackend } from 'strophe.js';

// Strophe keeps its XEP-0198 state (counters plus every unacked stanza) in
// sessionStorage so a reload can resume the stream. Its own backend has two
// sharp edges this one rounds off:
//
// - It hands back whatever was stored, and Strophe copies `enableSent` from
//   it. State saved between <enable/> and <enabled/> (a drop or reload in
//   that window) has no session id, so the next connection binds fresh but
//   believes it already asked for stream management: no <enable/> goes out,
//   no ack handlers are registered, and every stanza joins a queue that
//   nothing ever drains. Only state that can actually be resumed is loaded.
// - A failed write throws out of Strophe's send path, so once the queue
//   outgrows the quota every query and message fails. The stream state is a
//   convenience, so a write that fails drops it instead.
const isResumable = (state: SMState | null): state is SMState =>
  !!state && !!state.id && state.resumeSupported === true;

export const createStreamManagementStorage = (): SMStorageBackend => ({
  load: (key) => {
    try {
      const stored = sessionStorage.getItem(key);
      const state: SMState | null = stored ? JSON.parse(stored) : null;
      if (isResumable(state)) {
        return state;
      }
      if (stored) {
        sessionStorage.removeItem(key);
      }
      return null;
    } catch {
      return null;
    }
  },
  save: (key, state) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      try {
        sessionStorage.removeItem(key);
      } catch {
        // Storage is unavailable altogether; the session just won't resume.
      }
    }
  },
  clear: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Nothing to drop.
    }
  },
});
