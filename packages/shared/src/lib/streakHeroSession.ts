const STREAK_HERO_SHOWN_DAY_KEY = 'streak-hero-shown-day';
const STREAK_HERO_SHOWN_IN_SESSION_KEY = 'streak-hero-shown-in-session';

const getDayKeyInTimezone = (timezone?: string): string => {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone || 'UTC',
  }).format(new Date());
};

export const hasShownStreakHeroToday = (timezone?: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(STREAK_HERO_SHOWN_DAY_KEY) ===
      getDayKeyInTimezone(timezone)
    );
  } catch {
    return false;
  }
};

export const hasShownStreakHeroInSession = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return (
      window.sessionStorage.getItem(STREAK_HERO_SHOWN_IN_SESSION_KEY) === '1'
    );
  } catch {
    return false;
  }
};

export const markStreakHeroShown = (timezone?: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      STREAK_HERO_SHOWN_DAY_KEY,
      getDayKeyInTimezone(timezone),
    );
    window.sessionStorage.setItem(STREAK_HERO_SHOWN_IN_SESSION_KEY, '1');
  } catch {
    // Ignore storage failures in restricted environments.
  }
};
