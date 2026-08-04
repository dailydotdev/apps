import { fallbackImages } from '../../lib/config';
import { sampleWeeklyQuiz } from './sampleWeeklyQuiz';
import { WeeklyQuizPeriod } from './types';
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
      'https://media.daily.dev/image/upload/s--dOB9RaXY--/f_auto/v1773320801/avatars/avatar_iaC4JsBU0lV8wBsc85fSh?_a=BAMAMiiu0',
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
      'https://media.daily.dev/image/upload/s--9gxFz1e7--/f_auto/v1705902590/avatars/avatar_JUNiIGCV-?_a=BAMAMiZW0',
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
    reputation: 48510,
    image: 'https://avatars.githubusercontent.com/u/2653546?v=4',
  },
  {
    id: '29TCpY2hJR72V3BlxPXzX',
    name: 'Daniel',
    username: 'akkitto',
    reputation: 47830,
    image:
      'https://media.daily.dev/image/upload/s--FtwJqX4c--/f_auto/v1754900041/avatars/avatar_29TCpY2hJR72V3BlxPXzX?_a=BAMClqZW0',
  },
  {
    id: 'IXalnaxWMtGrFtZ6XDX4U',
    name: 'Kirill Kurko',
    username: 'kkurko',
    reputation: 31350,
    image: 'https://avatars.githubusercontent.com/u/58859242?v=4',
  },
  {
    id: 'G85JhYcDxAg024Omc8Rlp',
    name: 'Damien seguy',
    username: 'damienseguy',
    reputation: 30390,
    image:
      'https://media.daily.dev/image/upload/s--nPbjKqol--/f_auto,q_auto/v1698422671/avatars/avatar_G85JhYcDxAg024Omc8Rlp',
  },
  {
    id: 'eCYKGSsVlzKQY1G7NxkJc',
    name: 'Friedrich WT',
    username: 'friedrich',
    reputation: 30070,
    image: 'https://avatars.githubusercontent.com/u/136119888?v=4',
  },
  {
    id: '5zahWGRIGj4Y3VQ3jIlBS',
    name: 'Debajyati Dey',
    username: 'debajyatidey',
    reputation: 29900,
    image: 'https://avatars.githubusercontent.com/u/127122455?v=4',
  },
  {
    id: 'Qz65P1nVw3Bu6C5YwaZgA',
    name: 'Peter Mrożek',
    username: 'petermrozek',
    reputation: 29845,
    image:
      'https://media.daily.dev/image/upload/s--pBfYX68K--/f_auto/v1769247960/avatars/avatar_Qz65P1nVw3Bu6C5YwaZgA?_a=BAMAMiiu0',
  },
  {
    id: 'bu452DQxxXbGcj178k2RJ',
    name: 'Tessa van der Heijden',
    username: 'tvdheijden',
    reputation: 29550,
    image:
      'https://media.daily.dev/image/upload/s--efFpmmNm--/f_auto/v1705569455/avatars/avatar_bu452DQxxXbGcj178k2RJ',
  },
  {
    id: 'dR92D50hh',
    name: 'George',
    username: 'feketegy',
    reputation: 27520,
    image:
      'https://media.daily.dev/image/upload/s--YeiBYVuL--/f_auto/v1743758421/avatars/avatar_dR92D50hh',
  },
  {
    id: 'WXcnVdXbQljWuHJCBcViw',
    name: 'Divyesh Vekariya',
    username: 'divyesh_vekariya',
    reputation: 27320,
    image:
      'https://media.daily.dev/image/upload/s--RDCl1xsD--/f_auto/v1728905544/avatars/avatar_WXcnVdXbQljWuHJCBcViw',
  },
  {
    id: '9pqnrpoJdg1CfgqIBuMCl',
    name: 'Hadil Ben Abdallah',
    username: 'hadilbenabdallah',
    reputation: 26580,
    image:
      'https://media.daily.dev/image/upload/s--npVXQBAk--/f_auto/v1726134205/avatars/avatar_9pqnrpoJdg1CfgqIBuMCl',
  },
  {
    id: 'g4ZJecDKXrCh6bYVK1iyV',
    name: 'Szymon Omieciński',
    username: 'simon125q',
    reputation: 25520,
    image:
      'https://media.daily.dev/image/upload/s--ZNKkeUvQ--/f_auto/v1762695887/avatars/avatar_g4ZJecDKXrCh6bYVK1iyV?_a=BAMAK+ZW0',
  },
  {
    id: 'cmPs2DO0hyj5zVizDLJDZ',
    name: 'Mouad Dadda',
    username: 'mouad_dadda',
    reputation: 22540,
    image:
      'https://media.daily.dev/image/upload/s--qvecFxpC--/f_auto/v1746013117/avatars/avatar_cmPs2DO0hyj5zVizDLJDZ',
  },
  {
    id: 'zyFqB01G2vXeC6aJycktp',
    name: 'Ezpie',
    username: 'ezpie',
    reputation: 22300,
    image: 'https://avatars.githubusercontent.com/u/104765117?v=4',
  },
  {
    id: 'sDzCovimjL',
    name: 'TheCoverLiker',
    username: 'thecoverliker',
    reputation: 20940,
    image:
      'https://media.daily.dev/image/upload/v1681623072/avatars/avatar_sDzCovimjL.jpg',
  },
  {
    id: 'SOwG1kJqf6HK6TkGmZH45',
    name: 'Daniel',
    username: 'daniel8000',
    reputation: 20900,
    image:
      'https://media.daily.dev/image/upload/s--F_RltCZK--/f_auto/v1738746891/avatars/avatar_SOwG1kJqf6HK6TkGmZH45',
  },
  {
    id: '5cQvIZKr5tDFDotVDjulg',
    name: 'Jacob B. Bonde',
    username: 'byteoutlaw',
    reputation: 20895,
    image:
      'https://media.daily.dev/image/upload/s--veTChHK7--/f_auto/v1733220070/avatars/avatar_5cQvIZKr5tDFDotVDjulg',
  },
  {
    id: 'Su5HqluAE4wLRb1naHjtv',
    name: 'Serdarcan Buyukdereli',
    username: 'serdarbuyukdereli',
    reputation: 20380,
    image:
      'https://media.daily.dev/image/upload/s--tTV8hAPq--/f_auto/v1778701721/avatars/avatar_Su5HqluAE4wLRb1naHjtv?_a=BAMAMiWQ0',
  },
  {
    id: 'SEMcvjKuE',
    name: 'Kevin',
    username: 'kyoukhana',
    reputation: 20115,
    image: 'https://avatars2.githubusercontent.com/u/756849?v=4',
  },
  {
    id: 'N403VFK9lAHNRwlSAhl1h',
    name: 'Phillippe Michel Weir',
    username: 'a_meb_a',
    reputation: 19980,
    image:
      'https://media.daily.dev/image/upload/s--BwH-uTMq--/f_auto/v1740136991/avatars/avatar_N403VFK9lAHNRwlSAhl1h',
  },
  {
    id: 'iWZFqWGzJuZ3TMf4ZW9aZ',
    name: 'Anmol Baranwal',
    username: 'anmolbaranwal',
    reputation: 19650,
    image: 'https://avatars.githubusercontent.com/u/74038190?v=4',
  },
  {
    id: 'CuJEPTEsDJlaKzfXt7xfz',
    name: 'Dickson A.',
    username: 'fabidick22',
    reputation: 19000,
    image: 'https://avatars.githubusercontent.com/u/8176821?v=4',
  },
  {
    id: 'umWZ9aQAng34qk5aaJl2q',
    name: 'Lars Faye | Confident Coding',
    username: 'confidentcoding',
    reputation: 18970,
    image:
      'https://media.daily.dev/image/upload/s--OGZu5DEc--/f_auto/v1772569630/avatars/avatar_umWZ9aQAng34qk5aaJl2q?_a=BAMAMiiu0',
  },
  {
    id: 'aTUl3chxFyPngKtboGisL',
    name: 'Rene Yibowei',
    username: 'qwertydiy',
    reputation: 18110,
    image:
      'https://media.daily.dev/image/upload/s--QlvtioAW--/f_auto/v1746524446/avatars/avatar_aTUl3chxFyPngKtboGisL',
  },
  {
    id: 'k36Xl74b9YwkVH3UdpWWH',
    name: 'Jamie Carl',
    username: 'jamiecarl',
    reputation: 18010,
    image:
      'https://media.daily.dev/image/upload/s--6HKK4uxD--/f_auto/v1774926661/avatars/avatar_k36Xl74b9YwkVH3UdpWWH?_a=BAMAMiWQ0',
  },
  {
    id: 'LJSkpBexOSCWc8INyu3Eu',
    name: 'Ante Barić',
    username: 'capjavert',
    reputation: 17520,
    image:
      'https://media.daily.dev/image/upload/v1679300599/avatars/avatar_LJSkpBexOSCWc8INyu3Eu.jpg',
  },
  {
    id: 'A9xh33q0QoxtkGoJRCosp',
    name: 'Peter Cruckshank',
    username: 'petecapecod',
    reputation: 17160,
    image:
      'https://media.daily.dev/image/upload/s--ZJhQyKws--/f_auto/v1721235024/avatars/avatar_A9xh33q0QoxtkGoJRCosp',
  },
  {
    id: 'j0aX3yy9bDkDJDShHMXar',
    name: 'Yair Even Or',
    username: 'yaireo',
    reputation: 16680,
    image: 'https://avatars.githubusercontent.com/u/845031?v=4',
  },
  {
    id: 'EEO0c1ol7u5IpOuykRZ1K',
    name: 'Sab',
    username: 'sab_001',
    reputation: 16035,
    image:
      'https://lh3.googleusercontent.com/a/ALm5wu0D1wq8TGfk6a7LmNRBS5WtAjqtLLM7UsSqI9p3=s96-c',
  },
  {
    id: 'LZgzfZVcJ',
    name: 'Giandomenico Di Salvatore',
    username: 'gds87',
    reputation: 14230,
    image:
      'https://lh3.googleusercontent.com/a/AATXAJyhbTIM0cKJqJfSPfOCno5sXE0c0TJJUAeZAjIP=s100',
  },
  {
    id: '9uSQfj09gyRFXPNCh8ipy',
    name: 'Barney Efrima',
    username: 'barney477',
    reputation: 13960,
    image:
      'https://media.daily.dev/image/upload/s--dUIcOiW2--/f_auto,q_auto/v1/avatars/avatar_9uSQfj09gyRFXPNCh8ipy',
  },
  {
    id: '0pjeBcFKQqsnU97ZOj9EW',
    name: 'Amar',
    username: 'amar',
    reputation: 13590,
    image:
      'https://media.daily.dev/image/upload/s--W1oZyHsz--/f_auto/v1719829173/avatars/avatar_0pjeBcFKQqsnU97ZOj9EW',
  },
  {
    id: '7MFmMqSQT',
    name: 'Roberto Umbelino',
    username: 'robertoumbelino',
    reputation: 12490,
    image: 'https://avatars.githubusercontent.com/u/17939056?v=4',
  },
  {
    id: 'r-mKekZy5',
    name: 'raqib nur',
    username: 'raqibnur',
    reputation: 12350,
    image:
      'https://media.daily.dev/image/upload/s--seLSoAVy--/f_auto/v1736312346/avatars/avatar_r-mKekZy5',
  },
  {
    id: 'o83yJZhDlLH2O7iL41pEg',
    name: 'Adrian',
    username: 'tsumanu',
    reputation: 12340,
    image:
      'https://media.daily.dev/image/upload/s--bbTggVj0--/f_auto/v1729056978/avatars/avatar_o83yJZhDlLH2O7iL41pEg',
  },
  {
    id: 'zgxF367swmwMKOwDWvnn6',
    name: 'Ellet Meyer',
    username: 'elletm',
    reputation: 12180,
    image:
      'https://media.daily.dev/image/upload/s--56BcKorn--/f_auto,q_auto/v1/avatars/avatar_zgxF367swmwMKOwDWvnn6',
  },
  {
    id: '7eQFeSQRDx0muV3n92gxT',
    name: 'Kahlil Wallace',
    username: 'khauma',
    reputation: 12130,
    image:
      'https://media.daily.dev/image/upload/s--QvppE9Ip--/f_auto/v1767378558/avatars/avatar_7eQFeSQRDx0muV3n92gxT?_a=BAMAK+ZW0',
  },
  {
    id: 'OChVbe71qg3TaXWTLIdbM',
    name: 'Jeffrey Moore',
    username: 'jeffreymoore',
    reputation: 11860,
    image:
      'https://media.daily.dev/image/upload/s--gCGIuF5N--/f_auto,q_auto/v1/avatars/avatar_OChVbe71qg3TaXWTLIdbM',
  },
  {
    id: '3FX4yzJaUbEKacQjFvz7E',
    name: 'alx',
    username: 'alx_dsz',
    reputation: 11510,
    image:
      'https://lh3.googleusercontent.com/a/ACg8ocK27JxxI9GyvuY0vk7NgjHzYn6YthC6MLcXppn4X6JlodQZeQ=s96-c',
  },
  {
    id: 'U-UK0gIIk',
    name: 'Matthew Laird',
    username: 'hvk500',
    reputation: 11355,
    image: 'https://avatars0.githubusercontent.com/u/14907718?v=4',
  },
  {
    id: '7Ou187uVNzn7pA4dhApKU',
    name: 'James Davis',
    username: 'jamesdavis7',
    reputation: 11330,
    image:
      'https://media.daily.dev/image/upload/s--LfM5k4Xi--/f_auto,q_auto/v1700407141/avatars/avatar_7Ou187uVNzn7pA4dhApKU',
  },
];

// Weekly is a single quiz; Monthly/All-time are cumulative — totals sum across
// the period's quizzes while time stays the player's fastest single run. These
// factors fake that aggregation for the demo so the tabs show, e.g., 40/40.
const QUIZZES_PER_PERIOD: Record<WeeklyQuizPeriod, number> = {
  [WeeklyQuizPeriod.Weekly]: 1,
  [WeeklyQuizPeriod.Monthly]: 4,
  [WeeklyQuizPeriod.AllTime]: 18,
};

const buildDemoLeaderboard = (
  period: WeeklyQuizPeriod,
): WeeklyQuizLeaderboardEntry[] => {
  const quizzes = QUIZZES_PER_PERIOD[period];
  return DEMO_USERS.map((member, index): WeeklyQuizLeaderboardEntry => {
    const perQuizCorrect = Math.max(1, 10 - Math.floor(index / 2));
    return {
      ...member,
      rank: index + 1,
      // Cumulative correct / total questions across the period's quizzes.
      correctCount: perQuizCorrect * quizzes,
      totalQuestions: 10 * quizzes,
      // Fastest single run (not summed); ascends with rank as the tiebreak.
      timeMs: 34000 + index * 2500,
      isAllTimeSuperstar: index === 0,
    };
  });
};

// Period-aware demo board (used by the leaderboard hook in demo mode).
export const getDemoLeaderboard = buildDemoLeaderboard;

// Weekly board — the default used by the Storybook mock harness.
export const demoLeaderboard = buildDemoLeaderboard(WeeklyQuizPeriod.Weekly);

// A synthetic "your rank" row for the demo, so the preview's results screen
// shows a placement even though there's no real signed-in player.
export const getDemoViewerEntry = (
  period: WeeklyQuizPeriod,
): WeeklyQuizLeaderboardEntry => {
  const quizzes = QUIZZES_PER_PERIOD[period];
  return {
    id: 'demo-you',
    rank: 42,
    name: 'You',
    username: 'you',
    image: fallbackImages.avatar,
    correctCount: 6 * quizzes,
    totalQuestions: 10 * quizzes,
    timeMs: 62000,
    isCurrentUser: true,
    reputation: 1240,
  };
};
