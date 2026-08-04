import { buildWorld } from './engine/buildWorld';
import { REALMS } from './engine/taxonomy';
import type { WorldModel } from './worldState';

/**
 * A world nobody has read into yet: the six realms as bare ground.
 *
 * The land is the thing worth showing — every realm owns its own sky, landform,
 * rock and water, and all of that exists before a single article does. So an
 * empty world is not an empty screen and not a stand-in somebody else's reading
 * built. It is this reader's six pieces of ground, with nothing on them.
 *
 * The renderer lays out islands from districts, so each realm is seeded with one
 * district holding one read. That seed is scaffolding and nothing else: with
 * `unbuilt` set, the engine draws no signature monuments, labels every island
 * READ TO RAISE, reports zero articles and refuses to open a realm — so the
 * count never reaches a counter and the seed is never visible as a fact.
 */
export const buildUnbuiltWorld = (userId: string): WorldModel => {
  /* A day apart, in taxonomy order, and never shown: islands are packed in the
     order their realms were first read and the rail lists them the same way, so
     without this the six realms come out ordered by the slug of a seed district
     nobody can see. */
  const ground = REALMS.map((realm, index) => {
    const day = new Date(Date.UTC(2026, 0, 1 + index)).toISOString();

    return {
      niche: { slug: realm.niches[0].id },
      reads: 1,
      firstReadAt: day,
      lastReadAt: day,
      activeDays: 0,
    };
  });

  const model = buildWorld(userId, ground, []) as unknown as WorldModel;
  model.unbuilt = true;

  return model;
};
