import { buildUnbuiltWorld } from '../components/world/unbuiltWorld';
import { REALMS, REALM_OF } from '../components/world/engine/taxonomy';

interface BuiltWorld {
  user: string;
  unbuilt?: boolean;
  replayable: boolean;
  districts: { slug: string; i: number; articles: number }[];
  nD: number;
  nT: number;
}

const build = (userId = 'u1') =>
  buildUnbuiltWorld(userId) as unknown as BuiltWorld;

describe('unbuiltWorld', () => {
  it('is one piece of ground per realm and nothing else', () => {
    const world = build();
    const realmOf = REALM_OF as Record<string, { id: string }>;
    const realms = new Set(world.districts.map((d) => realmOf[d.slug].id));

    expect(world.nD).toBe(REALMS.length);
    expect(realms.size).toBe(REALMS.length);
  });

  // The seed district is what the layout packs islands from. It is not a read,
  // and the flag is what stops the renderer treating it as one.
  it('marks itself unbuilt so nothing counts the seed', () => {
    const world = build();

    expect(world.unbuilt).toBe(true);
    world.districts.forEach((district) => {
      expect(district.articles).toBe(1);
    });
  });

  it('has no history to replay', () => {
    const world = build();

    expect(world.replayable).toBe(false);
    expect(world.nT).toBe(1);
  });

  it('belongs to the reader it was built for', () => {
    expect(build('u2').user).toBe('u2');
  });
});
