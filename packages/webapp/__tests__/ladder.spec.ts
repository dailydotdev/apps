import {
  LEVELS,
  levelOf,
  levelProgress,
  MAX_LEVEL,
  nearestLevelUp,
  REALM_DIV,
  realmLevelOf,
} from '../components/world/ladder';

const row = (name: string, reads: number) => ({ key: name, name, reads });

describe('levelOf', () => {
  it('gives untouched ground no level at all', () => {
    expect(levelOf(0)).toEqual(0);
    expect(levelOf(-1)).toEqual(0);
  });

  it('lands exactly on every rung', () => {
    LEVELS.forEach((level, index) => {
      expect(levelOf(level.reads)).toEqual(index + 1);
    });
  });

  it('holds the rung until the next threshold is reached', () => {
    // 3 is CAMP and 5 is HOLD, so 4 is still a camp.
    expect(levelOf(4)).toEqual(3);
    expect(levelOf(1279)).toEqual(MAX_LEVEL - 1);
  });

  it('does not run off the top of the ladder', () => {
    expect(levelOf(LEVELS[MAX_LEVEL - 1].reads * 10)).toEqual(MAX_LEVEL);
  });
});

describe('levelProgress', () => {
  it('counts the articles left to the next rung', () => {
    // SANCTUM is 20.
    expect(levelProgress(18)).toMatchObject({ level: 5, toNext: 2 });
  });

  it('places the district across the rung it is on', () => {
    // Half way from ATELIER (10) to SANCTUM (20).
    expect(levelProgress(15).fraction).toEqual(0.5);
  });

  it('has nothing above the top rung', () => {
    expect(levelProgress(2000)).toEqual({
      level: MAX_LEVEL,
      toNext: 0,
      fraction: 1,
    });
  });
});

describe('realmLevelOf', () => {
  it('leaves a realm nobody has read at no level', () => {
    expect(realmLevelOf(0)).toEqual(0);
  });

  it('floors a realm that has been read at all to L1', () => {
    // 1/8 of an article is below the first rung, but the realm is not absent.
    expect(realmLevelOf(1)).toEqual(1);
  });

  it('moves the rungs out by the divisor', () => {
    expect(realmLevelOf(LEVELS[1].reads * REALM_DIV)).toEqual(2);
    expect(realmLevelOf(LEVELS[1].reads * REALM_DIV - 1)).toEqual(1);
  });
});

describe('levelProgress on the realm ladder', () => {
  it('counts what is left in articles, not in eighths', () => {
    // 3,372 articles sits on realm L10 (320 x 8); L11 is 640 x 8 = 5,120.
    expect(levelProgress(3372, REALM_DIV)).toMatchObject({
      level: 10,
      toNext: 5120 - 3372,
    });
  });

  it('never puts a floored L1 realm behind the start of its own bar', () => {
    // The rung's own threshold is 8 articles, but realmLevelOf floors at L1, so
    // a realm holding 1 would otherwise report a negative fraction.
    const progress = levelProgress(1, REALM_DIV);

    expect(progress.level).toEqual(1);
    expect(progress.fraction).toEqual(0);
    expect(progress.toNext).toEqual(LEVELS[1].reads * REALM_DIV - 1);
  });

  it('places a realm across the rung it is on', () => {
    // Half way from 8 to 16.
    expect(levelProgress(12, REALM_DIV).fraction).toEqual(0.5);
  });

  it('rounds a part-article up, because rungs are crossed by reading one', () => {
    expect(levelProgress(3.5, REALM_DIV).toNext).toEqual(13);
  });

  it('leaves the district ladder alone by default', () => {
    expect(levelProgress(18)).toMatchObject({ level: 5, toNext: 2 });
  });
});

describe('nearestLevelUp', () => {
  it('has nothing to point at in an empty world', () => {
    expect(nearestLevelUp([])).toBeNull();
    expect(nearestLevelUp(undefined)).toBeNull();
  });

  it('picks the closest district, not the biggest', () => {
    // The 318 district is 2 off ARCANUM; the 400 one is 240 off CITADEL.
    const nearest = nearestLevelUp([row('LLMs', 400), row('CSS & UI', 318)]);

    expect(nearest).toMatchObject({ name: 'CSS & UI', toNext: 2 });
  });

  it('ignores districts that have topped out', () => {
    const nearest = nearestLevelUp([row('LLMs', 1280), row('Rust', 30)]);

    expect(nearest).toMatchObject({ name: 'Rust', toNext: 10 });
  });

  it('is null when every district has topped out', () => {
    expect(nearestLevelUp([row('LLMs', 1280), row('Agents', 4000)])).toBeNull();
  });

  it('breaks a tie towards the district further along', () => {
    // Both one article out, from CAIRN and from SKY COURT respectively.
    const nearest = nearestLevelUp([row('PHP', 1), row('LLMs', 1279)]);

    expect(nearest).toMatchObject({ name: 'LLMs', toNext: 1 });
  });

  it('carries the rung it is walking towards', () => {
    expect(nearestLevelUp([row('Go', 39)])?.next).toMatchObject({
      n: 'CONCLAVE',
      reads: 40,
    });
  });
});
