// A tiny in-memory bus so Patchy can react to what the user does without every
// card, modal and page passing callbacks down. The mutations that matter emit
// here; the rail companion is the only subscriber. Emitting with no listener
// (flag off, phone, extension) is a no-op.
export type PatchyEvent =
  | { type: 'upvote' }
  | { type: 'bookmark' }
  // The first counted read of the local day (the streak moved).
  | { type: 'streak_day' }
  | { type: 'post_open'; tags?: string[] };

type Listener = (event: PatchyEvent) => void;

const listeners = new Set<Listener>();

export const emitPatchyEvent = (event: PatchyEvent): void => {
  listeners.forEach((listener) => listener(event));
};

export const subscribePatchyEvents = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
