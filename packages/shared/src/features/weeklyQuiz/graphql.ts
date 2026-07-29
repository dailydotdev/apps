// GraphQL contract for the Weekly Quiz. Mirrors the daily-api shapes in
// ./types.ts so hooks can bind directly to live queries.

// Banner + intro state. Public: works for anonymous visitors, whose
// completion/result fields come back false/null. `isActive` is the
// server-controlled availability window (last two days of the week).
export const WEEKLY_QUIZ_STATUS_QUERY = `
  query WeeklyQuizStatus {
    weeklyQuizStatus {
      isActive
      activeQuizId
      hasCompletedThisWeek
      hasCompletedLastWeek
      thisWeekResult {
        quizId
        correctCount
        totalQuestions
        timeMs
        rank
      }
      lastWeekResult {
        quizId
        correctCount
        totalQuestions
        timeMs
        rank
      }
    }
  }
`;

// The active quiz's questions. `isCorrect` on the option enables instant local
// feedback; the backend still recomputes the score on submit.
export const WEEKLY_QUIZ_QUERY = `
  query WeeklyQuiz($id: ID!) {
    weeklyQuiz(id: $id) {
      id
      week
      title
      welcomeText
      questions {
        id
        prompt
        options {
          id
          label
          isCorrect
        }
      }
    }
  }
`;

// Ranked by correct answers first, total time as the tiebreak. `viewerEntry`
// is included only for logged-in players and pins their own row when they're
// outside the visible page (mirrors giveback's contributionUserRank).
export const WEEKLY_QUIZ_LEADERBOARD_QUERY = `
  query WeeklyQuizLeaderboard(
    $period: WeeklyQuizPeriod!
    $first: Int
    $withViewerRank: Boolean!
  ) {
    weeklyQuizLeaderboard(period: $period, first: $first) {
      edges {
        node {
          user {
            id
            name
            username
            image
            reputation
          }
          correctCount
          totalQuestions
          timeMs
          rank
          isAllTimeSuperstar
        }
      }
    }
    weeklyQuizViewerEntry(period: $period) @include(if: $withViewerRank) {
      correctCount
      totalQuestions
      timeMs
      rank
    }
  }
`;

// Submit a finished attempt. Logged-in only. The backend recomputes the score
// from the answers and returns the authoritative result + rank.
export const SUBMIT_WEEKLY_QUIZ_MUTATION = `
  mutation SubmitWeeklyQuizResult($input: SubmitWeeklyQuizResultInput!) {
    submitWeeklyQuizResult(input: $input) {
      quizId
      correctCount
      totalQuestions
      timeMs
      rank
    }
  }
`;
