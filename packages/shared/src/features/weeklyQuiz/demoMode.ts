import { fallbackImages } from '../../lib/config';
import { sampleWeeklyQuiz } from './sampleWeeklyQuiz';
import type { WeeklyQuizLeaderboardEntry, WeeklyQuizStatus } from './types';

// TEMPORARY demo scaffolding so the flag-gated, backend-less quiz can be tested
// on a webapp preview: append `?weekly-quiz-demo=1` to any URL. It flips the
// feature on and the data hooks return the sample/mock content below instead of
// hitting GraphQL. Sticky for the session so it survives feed navigation.
// Remove once the backend + flag are live.
const DEMO_PARAM = 'weekly-quiz-demo';
const STORAGE_KEY = 'weekly_quiz_demo';

export const isWeeklyQuizDemo = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    if (new URLSearchParams(window.location.search).has(DEMO_PARAM)) {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
      return true;
    }
    return window.sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

// Turn demo mode on programmatically (used by the standalone preview page).
export const enableWeeklyQuizDemo = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Ignore storage failures (private mode, etc.).
  }
};

export const demoStatus: WeeklyQuizStatus = {
  isActive: true,
  activeQuizId: sampleWeeklyQuiz.id,
  hasCompletedThisWeek: false,
  hasCompletedLastWeek: false,
  thisWeekResult: null,
  lastWeekResult: null,
};

const DEMO_NAMES = [
  'Ana Pereira',
  'Marco Reyes',
  'Priya Nair',
  'Kenji Watanabe',
  'Lena Fischer',
  'Diego Silva',
  'Mei Lin',
  'Omar Haddad',
  'Sofia Rossi',
  'Noah Becker',
  'Yuki Tanaka',
  'Amara Okafor',
];

export const demoLeaderboard: WeeklyQuizLeaderboardEntry[] = DEMO_NAMES.map(
  (name, index): WeeklyQuizLeaderboardEntry => ({
    id: `demo-${index + 1}`,
    rank: index + 1,
    name,
    username: name.toLowerCase().replace(/\s+/g, ''),
    image: fallbackImages.avatar,
    correctCount: Math.max(1, 10 - Math.floor(index / 2)),
    totalQuestions: 10,
    timeMs: 34000 + index * 2500,
    reputation: 92000 - index * 4200,
    isAllTimeSuperstar: index === 0,
  }),
);
