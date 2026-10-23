/** The time-of-day greeting on the rail's header, by the reader's clock. */
export const greetingForHour = (hour: number): string => {
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
};

export const railGreeting = (
  now: Date,
  name?: string,
): { title: string; subtitle: string } => {
  const partOfDay = greetingForHour(now.getHours());
  const firstName = name?.trim().split(/\s+/)[0];

  return {
    title: firstName ? `${partOfDay}, ${firstName}` : partOfDay,
    subtitle: now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
  };
};
