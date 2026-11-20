import type { Post } from '../../graphql/posts';

// A tiny in-memory bus so Patchy can react to what the user does without every
// card, modal and page passing callbacks down. The mutations that matter emit
// here; the rail companion is the only subscriber. Emitting with no listener
// (flag off, phone, extension) is a no-op.
export type PatchyEvent =
  | { type: 'upvote'; postId?: string }
  | { type: 'bookmark'; postId?: string }
  // The first counted read of the local day (the streak moved).
  | { type: 'streak_day' }
  // A post opened; the post rides along so he can read along with you.
  | { type: 'post_open'; tags?: string[]; post?: Partial<Post> };

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
