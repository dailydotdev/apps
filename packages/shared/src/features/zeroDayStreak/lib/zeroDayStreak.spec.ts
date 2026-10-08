import {
  ZERO_DAY_STREAK_LENGTH,
  ZeroDayCellState,
  getZeroDayNumber,
  getZeroDayWeek,
  isZeroDayAccount,
} from './zeroDayStreak';

const { Claimed, Today, Upcoming } = ZeroDayCellState;

describe('getZeroDayWeek', () => {
  it('opens the run on day one with nothing claimed', () => {
    expect(getZeroDayWeek({ currentStreak: 0, claimedToday: false })).toEqual([
      Today,
      ...Array(6).fill(Upcoming),
    ]);
  });

  // `currentStreak` already counts today once today is claimed, so the today
  // cell has to step BACK into the run rather than forward past it — otherwise
  // claiming visibly skips a day.
  it('marks today as the last filled cell once claimed', () => {
    expect(getZeroDayWeek({ currentStreak: 3, claimedToday: true })).toEqual([
      Claimed,
      Claimed,
      Today,
      ...Array(4).fill(Upcoming),
    ]);
  });

  it('marks today as the next empty cell while the claim is still open', () => {
    expect(getZeroDayWeek({ currentStreak: 3, claimedToday: false })).toEqual([
      Claimed,
      Claimed,
      Claimed,
      Today,
      ...Array(3).fill(Upcoming),
    ]);
  });

  it('fills the whole week on the seventh claim', () => {
    expect(getZeroDayWeek({ currentStreak: 7, claimedToday: true })).toEqual([
      ...Array(6).fill(Claimed),
      Today,
    ]);
  });
});

describe('getZeroDayNumber', () => {
  it('counts the day being claimed, not the one after it', () => {
    expect(getZeroDayNumber({ currentStreak: 3, claimedToday: true })).toBe(3);
    expect(getZeroDayNumber({ currentStreak: 3, claimedToday: false })).toBe(4);
  });

  it('starts at day one on an empty streak', () => {
    expect(getZeroDayNumber({ currentStreak: 0, claimedToday: false })).toBe(1);
  });

  it('never counts past the end of the run', () => {
    expect(getZeroDayNumber({ currentStreak: 7, claimedToday: false })).toBe(
      ZERO_DAY_STREAK_LENGTH,
    );
  });
});

describe('isZeroDayAccount', () => {
  const now = new Date('2026-09-17T12:00:00.000Z');

  it('enrols an account inside the window', () => {
    expect(isZeroDayAccount('2026-09-10T12:00:00.000Z', now)).toBe(true);
  });

  it('drops an account past the window', () => {
    expect(isZeroDayAccount('2026-08-01T12:00:00.000Z', now)).toBe(false);
  });

  it('ignores a missing or unparseable creation date', () => {
    expect(isZeroDayAccount(undefined, now)).toBe(false);
    expect(isZeroDayAccount('not a date', now)).toBe(false);
  });
});
