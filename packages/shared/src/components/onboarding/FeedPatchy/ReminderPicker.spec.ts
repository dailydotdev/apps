import { formatHour } from './ReminderPicker';

describe('formatHour', () => {
  it('reads a 24-hour clock by default', () => {
    expect(formatHour(0)).toBe('00:00');
    expect(formatHour(17)).toBe('17:00');
  });

  it('reads midnight, noon and evening on a 12-hour clock', () => {
    expect(formatHour(0, true)).toBe('12:00 AM');
    expect(formatHour(12, true)).toBe('12:00 PM');
    expect(formatHour(23, true)).toBe('11:00 PM');
  });
});
