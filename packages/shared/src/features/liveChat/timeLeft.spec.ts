import { formatTimeLeft } from './timeLeft';

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
