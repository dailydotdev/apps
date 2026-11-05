import {
  LIVE_CHAT_COUNT_FROM,
  formatEndsIn,
  formatOccupants,
  formatTimeLeft,
} from './timeLeft';

describe('formatTimeLeft', () => {
  const now = new Date('2026-10-26T12:00:00Z').getTime();

  it('rounds to hours past the first one', () => {
    expect(formatTimeLeft('2026-10-27T05:20:00Z', now)).toEqual('17h');
    expect(formatTimeLeft('2026-10-26T13:00:00Z', now)).toEqual('1h');
  });

  it('counts minutes under an hour and never goes negative', () => {
    expect(formatTimeLeft('2026-10-26T12:45:00Z', now)).toEqual('45m');
    expect(formatTimeLeft('2026-10-26T12:00:30Z', now)).toEqual('1m');
    expect(formatTimeLeft('2026-10-26T11:00:00Z', now)).toEqual('0m');
  });
});

describe('formatOccupants', () => {
  it('says nothing of a room still filling up', () => {
    expect(formatOccupants(0)).toBeUndefined();
    expect(formatOccupants(LIVE_CHAT_COUNT_FROM - 1)).toBeUndefined();
    expect(formatOccupants(null)).toBeUndefined();
  });

  it('announces a crowd', () => {
    expect(formatOccupants(LIVE_CHAT_COUNT_FROM)).toEqual('10 here');
    expect(formatOccupants(230)).toEqual('230 here');
  });
});

describe('formatEndsIn', () => {
  const now = new Date('2026-10-26T12:00:00Z').getTime();

  it('keeps quiet while the room has hours ahead of it', () => {
    expect(formatEndsIn('2026-10-27T10:00:00Z', now)).toBeUndefined();
    expect(formatEndsIn('2026-10-26T13:00:01Z', now)).toBeUndefined();
    expect(formatEndsIn(null, now)).toBeUndefined();
  });

  it('shows the clock once the end is close', () => {
    expect(formatEndsIn('2026-10-26T13:00:00Z', now)).toEqual('ends in 1h');
    expect(formatEndsIn('2026-10-26T12:45:00Z', now)).toEqual('ends in 45m');
  });
});
