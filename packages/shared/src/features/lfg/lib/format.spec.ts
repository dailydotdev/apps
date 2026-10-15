import {
  formatUtcOffset,
  getLfgReachOutUrl,
  getUtcOffsetForTimeZone,
  lfgRelativeDays,
} from './format';

describe('formatUtcOffset', () => {
  it.each([
    [1, 'UTC+1'],
    [0, 'UTC+0'],
    [-3, 'UTC-3'],
    [5.5, 'UTC+5:30'],
    [5.75, 'UTC+5:45'],
    [-9.5, 'UTC-9:30'],
  ])('shows %s as %s', (offset, label) => {
    expect(formatUtcOffset(offset)).toBe(label);
  });
});

describe('getUtcOffsetForTimeZone', () => {
  const winter = new Date('2026-01-15T12:00:00Z');

  it("reads the offset of the profile's time zone", () => {
    expect(getUtcOffsetForTimeZone('Asia/Kolkata', winter)).toBe(5.5);
    expect(getUtcOffsetForTimeZone('America/New_York', winter)).toBe(-5);
    expect(getUtcOffsetForTimeZone('Etc/UTC', winter)).toBe(0);
  });

  it('falls back to the device for an unknown zone', () => {
    expect(getUtcOffsetForTimeZone('Not/AZone', winter)).toBe(
      -winter.getTimezoneOffset() / 60,
    );
  });
});

describe('lfgRelativeDays', () => {
  const now = new Date('2026-10-15T10:00:00Z');

  it('counts whole days', () => {
    expect(lfgRelativeDays('2026-10-15T08:00:00Z', now)).toBe('today');
    expect(lfgRelativeDays('2026-10-14T08:00:00Z', now)).toBe('yesterday');
    expect(lfgRelativeDays('2026-10-11T08:00:00Z', now)).toBe('4d ago');
  });
});

describe('getLfgReachOutUrl', () => {
  it('opens a reach-out in the Requests tab of Messages', () => {
    expect(getLfgReachOutUrl('r1')).toMatch(
      /messages\?tab=requests&reachOut=r1$/,
    );
    expect(getLfgReachOutUrl()).toMatch(/messages\?tab=requests$/);
  });
});
