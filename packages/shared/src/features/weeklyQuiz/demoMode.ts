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

// Real daily.dev members pulled from the public reputation leaderboard, used
// only so the preview looks populated for testing. Names/avatars/reputation are
// their real public profile data; the quiz scores/times below are synthetic
// (there's no live quiz backend yet). TEMPORARY — remove with the rest of the
// demo scaffolding once the real leaderboard ships.
const DEMO_USERS = [
  {
    id: '9aDj6fGmy',
    name: 'Bobby Iliev',
    username: 'bobbyiliev',
    reputation: 73820,
    image: 'https://avatars3.githubusercontent.com/u/21223421?v=4',
  },
  {
    id: 'HXYbbGcBO38Rfv7RrCBdA',
    name: 'Randy',
    username: 'randy',
    reputation: 68700,
    image:
      'https://media.daily.dev/image/upload/s--UjV4-KkB--/f_auto/v1708097210/avatars/avatar_HXYbbGcBO38Rfv7RrCBdA',
  },
  {
    id: 'XDCZD-PHG',
    name: 'Ole-Martin',
    username: 'ombratteng',
    reputation: 65250,
    image: 'https://avatars.githubusercontent.com/u/1681525?v=4',
  },
  {
    id: 'iaC4JsBU0lV8wBsc85fSh',
    name: 'Joud Awad',
    username: 'joudawad',
    reputation: 61520,
    image:
      'https://media.daily.dev/image/upload/s--dOB9RaXY--/f_auto/v1773320801/avatars/avatar_iaC4JsBU0lV8wBsc85fSh',
  },
  {
    id: 'yRuVFf6IbfTylBjx9Dzvt',
    name: 'Denis Bolkovskis',
    username: 'denisb0',
    reputation: 56490,
    image:
      'https://media.daily.dev/image/upload/s--PGCuYx85--/f_auto,q_auto/v1/avatars/avatar_yRuVFf6IbfTylBjx9Dzvt',
  },
  {
    id: 'pWEhX8JhjnUQB2l4CNVSW',
    name: 'OrcDev',
    username: 'orcdev',
    reputation: 54710,
    image: 'https://avatars.githubusercontent.com/u/7549148?v=4',
  },
  {
    id: 'WVJSfJtDe63PxQFAsmXFO',
    name: 'Anja P',
    username: 'anjapcodes',
    reputation: 50790,
    image:
      'https://media.daily.dev/image/upload/s--M_c0s8Ky--/f_auto/v1721658650/avatars/avatar_WVJSfJtDe63PxQFAsmXFO',
  },
  {
    id: 'JUNiIGCV-',
    name: 'Chris Bongers',
    username: 'dailydevtips',
    reputation: 49255,
    image:
      'https://media.daily.dev/image/upload/s--9gxFz1e7--/f_auto/v1705902590/avatars/avatar_JUNiIGCV-',
  },
  {
    id: 'V7baLm8Y0o32yjz1hHf5a',
    name: 'Fabian Letsch',
    username: 'fabianletsch',
    reputation: 48660,
    image:
      'https://lh3.googleusercontent.com/a/ACg8ocKR6BVy_wn23EoOKq7-BlszlcXcLmASlnb7l-GtS-q1bePnkaJf=s96-c',
  },
  {
    id: 'otqAJUf6zdM9hfRwTlR9n',
    name: 'Isaac de Andrade',
    username: 'andradei',
    reputation: 48460,
    image: 'https://avatars.githubusercontent.com/u/2653546?v=4',
  },
  {
    id: '29TCpY2hJR72V3BlxPXzX',
    name: 'Daniel',
    username: 'akkitto',
    reputation: 47830,
    image:
      'https://media.daily.dev/image/upload/s--FtwJqX4c--/f_auto/v1754900041/avatars/avatar_29TCpY2hJR72V3BlxPXzX',
  },
  {
    id: 'IXalnaxWMtGrFtZ6XDX4U',
    name: 'Kirill Kurko',
    username: 'kkurko',
    reputation: 31350,
    image: 'https://avatars.githubusercontent.com/u/58859242?v=4',
  },
];

export const demoLeaderboard: WeeklyQuizLeaderboardEntry[] = DEMO_USERS.map(
  (member, index): WeeklyQuizLeaderboardEntry => ({
    ...member,
    rank: index + 1,
    // Synthetic quiz result — descending score, ascending time as the tiebreak.
    correctCount: Math.max(1, 10 - Math.floor(index / 2)),
    totalQuestions: 10,
    timeMs: 34000 + index * 2500,
    isAllTimeSuperstar: index === 0,
  }),
);
