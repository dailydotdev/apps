import { greetingForHour, railGreeting } from './greeting';

describe('railGreeting', () => {
  it('greets by the hour and the first name', () => {
    expect(greetingForHour(6)).toBe('Good morning');
    expect(greetingForHour(12)).toBe('Good afternoon');
    expect(greetingForHour(18)).toBe('Good evening');

    const noon = new Date(2026, 9, 19, 12, 0, 0);
    expect(railGreeting(noon, 'Tsahi Levent-Levi')).toEqual({
      title: 'Good afternoon, Tsahi',
      subtitle: 'Monday, October 19',
    });
    expect(railGreeting(noon).title).toBe('Good afternoon');
  });
});
