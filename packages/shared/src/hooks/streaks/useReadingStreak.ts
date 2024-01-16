interface UseReadingStreak {
  maxStreak: number;
  currentStreak: number;
  loading: boolean;
}

export const useReadingStreak = (): UseReadingStreak => {
  const streak = 0; // TODO: make this a query in a separate ticket

  return {
    maxStreak: 44,
    currentStreak: streak,
    loading: false,
  };
};
