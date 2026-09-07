/**
 * Reading a reader's world.
 *
 * There is no auth here and there is not supposed to be. A world page is public
 * unless its owner hid it, and `userWorld` applies that check for anonymous
 * callers already, so authoring against your own world needs no token, no OAuth
 * and no server of ours in the loop. A private world simply comes back empty,
 * which is the one case worth reporting plainly rather than rendering as an
 * island with nothing on it.
 */

const LADDER = [1, 2, 3, 5, 10, 20, 40, 80, 160, 320, 640, 1280];

/** The twelve rungs, third copy. Trivial, and the ladder never moves by design. */
export const levelOf = (reads) => {
  let level = 0;
  for (const rung of LADDER) if (reads >= rung) level += 1;
  return level;
};

/** Realm ladder: the same rungs spread across the reads of several districts. */
export const realmLevelOf = (reads) =>
  reads <= 0 ? 0 : Math.max(1, levelOf(reads / 8));

const USER = `query WorldUser($id: ID!) { user(id: $id) { id username name } }`;
/* Every field `buildWorld` reads, and no more. The timeline is the slow half
   and the world stands without it, so it is asked for separately and allowed
   to come back empty. */
const WORLD = `query World($id: ID!) {
  userWorld(id: $id) {
    reads firstReadAt lastReadAt activeDays
    niche { id slug title }
  }
}`;

async function gql(api, query, variables) {
  const res = await fetch(api, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok)
    throw new Error(`${api} answered ${res.status} ${res.statusText}`);
  const body = await res.json();
  if (body.errors?.length)
    throw new Error(body.errors.map((e) => e.message).join("; "));
  return body.data;
}

export async function fetchWorld(handle, { api }) {
  /* `user` takes a handle, `userWorld` takes the id it resolves to: the world
     tables are keyed on userId, so passing the handle straight through returns
     an empty world rather than an error, which reads exactly like a private one. */
  const user = (await gql(api, USER, { id: handle }))?.user;
  if (!user) throw new Error(`No daily.dev user called "${handle}".`);
  const world = await gql(api, WORLD, { id: user.id });

  const raw = world.userWorld ?? [];
  const districts = raw
    .map(({ reads, niche }) => ({
      niche: niche.slug,
      topic: niche.title,
      reads,
      level: levelOf(reads),
    }))
    .filter((d) => d.level > 0)
    .sort((a, b) => b.reads - a.reads);

  return { user, districts };
}
