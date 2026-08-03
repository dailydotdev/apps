import { buildWorld } from '../components/world/engine/buildWorld';
import { levelOf } from '../components/world/engine/taxonomy';

const district = (
  slug: string,
  reads: number,
  first = '2024-01-01',
  last = '2024-01-03',
) => ({
  niche: { slug },
  reads,
  firstReadAt: `${first}T00:00:00.000Z`,
  lastReadAt: `${last}T00:00:00.000Z`,
  activeDays: 2,
});

const growth = (date: string, slug: string, reads: number) => ({
  date: `${date}T00:00:00.000Z`,
  niche: { slug },
  reads,
});

interface BuiltWorld {
  districts: { slug: string; i: number; first: string }[];
  days: string[];
  cum: Int32Array;
  lvl: Uint8Array;
  daily: Int32Array;
  nD: number;
  nT: number;
  replayable: boolean;
  first: string;
  last: string;
}

const build = (...args: Parameters<typeof buildWorld>): BuiltWorld =>
  buildWorld(...args) as BuiltWorld;

const readsOn = (world: BuiltWorld, day: number, index: number): number =>
  world.cum[day * world.nD + index];

describe('buildWorld', () => {
  it('folds the growth log into a running total per district per day', () => {
    const world = build(
      'u1',
      [district('js_ts', 5), district('rust', 2)],
      [
        growth('2024-01-01', 'js_ts', 3),
        growth('2024-01-02', 'rust', 2),
        growth('2024-01-03', 'js_ts', 2),
      ],
    );

    expect(world.days).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
    const js = world.districts.findIndex((d) => d.slug === 'js_ts');
    const rust = world.districts.findIndex((d) => d.slug === 'rust');

    expect(readsOn(world, 0, js)).toBe(3);
    expect(readsOn(world, 0, rust)).toBe(0);
    // A total, not a delta: day two still carries day one's three.
    expect(readsOn(world, 1, js)).toBe(3);
    expect(readsOn(world, 2, js)).toBe(5);
    expect(readsOn(world, 2, rust)).toBe(2);
    expect(world.replayable).toBe(true);
  });

  it('drops niches the taxonomy has no district for', () => {
    const world = build(
      'u1',
      [district('js_ts', 4), district('blockchain', 99)],
      [
        growth('2024-01-01', 'js_ts', 4),
        growth('2024-01-01', 'blockchain', 99),
      ],
    );

    expect(world.districts.map((d) => d.slug)).toEqual(['js_ts']);
    expect(world.daily[0]).toBe(4);
  });

  it('stands a world up with no timeline, and says it cannot be replayed', () => {
    const world = build('u1', [district('js_ts', 40)], []);

    expect(world.nT).toBe(1);
    expect(world.replayable).toBe(false);
    expect(readsOn(world, 0, 0)).toBe(40);
    expect(world.lvl[0]).toBe(levelOf(40));
  });

  it('renders the growth log, never the districts table, once there is one', () => {
    // world-lab folds the world out of the growth log and reads size and level
    // off that fold. The districts row is only what the layout reserves land
    // for, so a short log stands a short district rather than being patched up
    // from the other table.
    const world = build(
      'u1',
      [district('js_ts', 100)],
      [growth('2024-01-01', 'js_ts', 4), growth('2024-01-02', 'js_ts', 6)],
    );

    expect(readsOn(world, 0, 0)).toBe(4);
    expect(readsOn(world, 1, 0)).toBe(10);
    expect(world.lvl[world.nT - 1]).toBe(levelOf(10));
  });

  it('orders districts by founding date so placement is append-only', () => {
    const world = build(
      'u1',
      [
        district('rust', 500, '2024-06-01'),
        district('js_ts', 5, '2024-01-01'),
        district('go', 50, '2024-03-01'),
      ],
      [],
    );

    expect(world.districts.map((d) => d.slug)).toEqual(['js_ts', 'go', 'rust']);
    expect(world.districts.map((d) => d.i)).toEqual([0, 1, 2]);
  });

  it('accepts a plain calendar date as well as a DateTime', () => {
    const world = build(
      'u1',
      [
        {
          niche: { slug: 'js_ts' },
          reads: 2,
          firstReadAt: '2024-01-01',
          lastReadAt: '2024-01-02',
          activeDays: 2,
        },
      ],
      [{ date: '2024-01-02', niche: { slug: 'js_ts' }, reads: 2 }],
    );

    expect(world.days).toEqual(['2024-01-02']);
    expect(world.districts[0].first).toBe('2024-01-01');
  });

  it('reports the lifetime span off the districts, with or without a log', () => {
    // The span is on screen before the growth log lands, so it cannot be read
    // off the day axis — the first build has one synthetic day on it.
    const districts = [
      district('js_ts', 5, '2024-01-01', '2024-03-01'),
      district('rust', 2, '2024-02-01', '2024-05-05'),
    ];

    [
      build('u1', districts, []),
      build('u1', districts, [growth('2024-02-01', 'rust', 2)]),
    ].forEach((world) => {
      expect(world.first).toBe('2024-01-01');
      expect(world.last).toBe('2024-05-05');
    });
  });

  it('stands the same world on the last day whether or not the log is in', () => {
    // What lets the growth log be attached to a world that is already up: the
    // day it is attached on is the day the world was raised on. If these two
    // ever disagreed, every island would be rebuilt under the reader.
    const districts = [district('js_ts', 5), district('rust', 2)];
    const bare = build('u1', districts, []);
    const full = build('u1', districts, [
      growth('2024-01-01', 'js_ts', 3),
      growth('2024-01-02', 'rust', 2),
      growth('2024-01-03', 'js_ts', 2),
    ]);

    expect(full.districts.map((d) => d.slug)).toEqual(
      bare.districts.map((d) => d.slug),
    );
    for (let i = 0; i < bare.nD; i += 1) {
      expect(readsOn(full, full.nT - 1, i)).toBe(readsOn(bare, 0, i));
      expect(full.lvl[(full.nT - 1) * full.nD + i]).toBe(bare.lvl[i]);
    }
  });

  it('refuses a world with nothing placeable in it', () => {
    expect(() => build('u1', [district('blockchain', 9)], [])).toThrow();
    expect(() => build('u1', [], [])).toThrow();
  });
});
