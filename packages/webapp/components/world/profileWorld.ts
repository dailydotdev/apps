import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';

/**
 * The profile's own render is what waits on this, so it is allowed to be late
 * exactly once. Past this the answer is "no world", which costs the page a
 * button; without it a stalled API costs the page.
 */
const TIMEOUT_MS = 2000;

/**
 * Whether this reader's world is worth putting a door to on their profile.
 *
 * Answered at build time so the toggle is in the first paint: it is a mode
 * switch for the whole page, and one that appears a beat late reads as the page
 * still settling.
 *
 * `userWorld` is the right question to ask rather than `userWorldSettings`. It
 * already applies privacy — a hidden world comes back as an empty list to
 * anyone but its owner, and static props have no session, so they are always
 * anyone. Settings would answer the wrong question twice over: it throws for a
 * hidden world, and returns null both for a reader who has never dressed a
 * perfectly good world and for one who has no world at all.
 *
 * Only `niche { slug }` is selected. Nothing here reads a district; the count
 * is the whole answer.
 */
export const hasPublicWorld = async (userId: string): Promise<boolean> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(graphqlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query ProfileHasWorld($id: ID!) {
          userWorld(id: $id) { niche { slug } }
        }`,
        variables: { id: userId },
      }),
      signal: controller.signal,
    });
    const body = await res.json();

    return !!body?.data?.userWorld?.length;
  } catch {
    // A profile that renders without its door beats one that does not render.
    return false;
  } finally {
    // Otherwise the pending timer holds the render open for its full length,
    // which is the thing this was added to prevent.
    clearTimeout(timer);
  }
};
