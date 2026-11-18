import {
  AWAY_MS,
  getPatchyMood,
  isAway,
  isFridayDeploy,
  isLateNight,
} from './patchyTriggers';

// Local-time dates: the rules read the browser's local clock.
const at = (day: number, hour: number, minute = 0) =>
  // November 2026: the 20th is a Friday.
  new Date(2026, 10, day, hour, minute);

describe('isLateNight', () => {
  it.each([
    [0, 59, false],
    [1, 0, true],
    [4, 59, true],
    [5, 0, false],
    [23, 30, false],
  ])('%i:%i is late night: %s', (hour, minute, expected) => {
    expect(isLateNight(at(18, hour, minute))).toBe(expected);
  });
});

describe('isFridayDeploy', () => {
  it('matches a deploy tag on Friday afternoon', () => {
    expect(isFridayDeploy(at(20, 16, 58), ['rust', 'deploy'])).toBe(true);
    expect(isFridayDeploy(at(20, 12), ['DevOps'])).toBe(true);
    expect(isFridayDeploy(at(20, 14), ['ci-cd'])).toBe(true);
  });

  it('ignores other days, the morning and the evening', () => {
    expect(isFridayDeploy(at(19, 16), ['deploy'])).toBe(false);
    expect(isFridayDeploy(at(20, 11, 59), ['deploy'])).toBe(false);
    expect(isFridayDeploy(at(20, 18), ['deploy'])).toBe(false);
  });

  it('needs a deploy tag', () => {
    expect(isFridayDeploy(at(20, 16), ['rust', 'docker'])).toBe(false);
    expect(isFridayDeploy(at(20, 16))).toBe(false);
  });
});

describe('isAway', () => {
  const now = at(18, 12);

  it('is away once the last read is 2 days old and nothing today', () => {
    expect(isAway(new Date(now.getTime() - AWAY_MS), false, now)).toBe(true);
    expect(isAway(new Date(now.getTime() - AWAY_MS + 1), false, now)).toBe(
      false,
    );
  });

  it('is never away after reading today or without any read', () => {
    expect(isAway(new Date(now.getTime() - AWAY_MS * 2), true, now)).toBe(
      false,
    );
    expect(isAway(undefined, false, now)).toBe(false);
  });
});

describe('getPatchyMood', () => {
  const lastViewAt = at(18, 9);

  it('naps instead of getting sad when you are away', () => {
    expect(
      getPatchyMood({
        state: 'pending',
        hasReadToday: false,
        lastViewAt: at(14, 9),
        now: at(18, 12),
      }),
    ).toBe('away');
  });

  it('gets sleepy late at night, even after reading', () => {
    expect(
      getPatchyMood({
        state: 'safe',
        hasReadToday: true,
        lastViewAt,
        now: at(19, 2),
      }),
    ).toBe('sleepy');
  });

  it('is happy once you read today and ready before', () => {
    expect(
      getPatchyMood({
        state: 'safe',
        hasReadToday: true,
        lastViewAt,
        now: at(18, 12),
      }),
    ).toBe('happy');
    expect(
      getPatchyMood({
        state: 'at_risk',
        hasReadToday: false,
        lastViewAt: at(17, 9),
        now: at(18, 20),
      }),
    ).toBe('ready');
  });

  it('rests on a rest day', () => {
    expect(
      getPatchyMood({
        state: 'freeze',
        hasReadToday: false,
        lastViewAt: at(17, 9),
        now: at(18, 12),
      }),
    ).toBe('resting');
  });
});
