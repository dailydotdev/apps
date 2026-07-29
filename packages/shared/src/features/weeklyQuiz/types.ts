// The Weekly Quiz: a recurring, game-like tech-news challenge that runs during
// the last two days of each week. Shapes here mirror the daily-api GraphQL
// contract so the UI binds directly to live queries. User-specific fields are
// null/absent for anonymous visitors — anyone can play, but the scoreboard and
// a player's own rank stay locked behind login.

// A single answer option. Exactly four per question; `isCorrect` is only set on
// the option that is correct, so the client can give instant feedback. The
// backend still recomputes the score authoritatively on submit.
export interface WeeklyQuizOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface WeeklyQuizQuestion {
  id: string;
  prompt: string;
  options: WeeklyQuizOption[];
}

// A news source the week's questions were drawn from — shown on the intro (logo
// + name) so players see what the quiz is based on. Mirrors the daily-api
// Source shape (id / name / image).
export interface WeeklyQuizSource {
  id: string;
  name: string;
  image: string;
}

// The active quiz for a given week. `welcomeText` is the editorial intro shown
// on the intro screen that teases the week's topics. Question count is
// configurable — it's whatever the week's data provides.
export interface WeeklyQuiz {
  id: string;
  // ISO week identifier (e.g. "2026-W30"), used to key results per week.
  week: string;
  // Inclusive date range the quiz recaps (ISO dates). Shown on the intro so
  // players know it covers *last* week's news, not an older one.
  startDate: string;
  endDate: string;
  title: string;
  welcomeText: string;
  // How much the week's news was distilled: `storyCount` stories drawn from
  // `sourceCount` sources, boiled down to `questions.length` questions. Shown as
  // the "N stories from M sources -> K questions" context line on the intro.
  storyCount: number;
  sourceCount: number;
  // The most-featured sources this week, shown on the intro. A preview subset of
  // the full `sourceCount` — the intro caps how many it renders and shows the
  // rest as a "+N more" count.
  topSources: WeeklyQuizSource[];
  questions: WeeklyQuizQuestion[];
}

// A player's finished result for a week. `rank` is null until the leaderboard
// has placed them (and always null for anonymous players).
export interface WeeklyQuizResult {
  quizId: string;
  correctCount: number;
  totalQuestions: number;
  // Total thinking time in milliseconds (feedback-reading time is excluded).
  timeMs: number;
  rank: number | null;
}

// Drives the banner and the intro screen's week toggle. `isActive` is the
// server-controlled availability window (the last-two-days schedule), so the
// banner shows consistently regardless of client timezone.
export interface WeeklyQuizStatus {
  isActive: boolean;
  activeQuizId: string | null;
  hasCompletedThisWeek: boolean;
  hasCompletedLastWeek: boolean;
  thisWeekResult: WeeklyQuizResult | null;
  lastWeekResult: WeeklyQuizResult | null;
}

// Which period the leaderboard aggregates. The quiz runs weekly; the monthly
// and all-time boards are cumulative standings across quizzes.
export enum WeeklyQuizPeriod {
  Weekly = 'WEEKLY',
  Monthly = 'MONTHLY',
  AllTime = 'ALL_TIME',
}

// A single scoreboard row. Ranked by correct answers first, total time as the
// tiebreak (both fields render). `isCurrentUser` tints the viewer's own row.
export interface WeeklyQuizLeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  username: string | null;
  image: string;
  correctCount: number;
  totalQuestions: number;
  timeMs: number;
  isCurrentUser?: boolean;
  // Player's daily.dev reputation, shown next to their name (as elsewhere).
  reputation?: number;
  // Backend-flagged: this player has finished #1 every week — an all-time
  // champion. Shown as an "All-time superstar" chip in place of "Fastest".
  isAllTimeSuperstar?: boolean;
}

// One answer the player picked, sent on submit. The backend maps option → score
// and recomputes correctness so a tampered client can't corrupt the leaderboard.
export interface WeeklyQuizAnswerInput {
  questionId: string;
  optionId: string;
}
