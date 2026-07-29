import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import WeeklyQuizModal from '@dailydotdev/shared/src/features/weeklyQuiz/components/WeeklyQuizModal';
import { useWeeklyQuizPlayed } from '@dailydotdev/shared/src/features/weeklyQuiz/hooks/useWeeklyQuizPlayed';
import { sampleWeeklyQuiz } from '@dailydotdev/shared/src/features/weeklyQuiz/sampleWeeklyQuiz';
import { enableWeeklyQuizDemo } from '@dailydotdev/shared/src/features/weeklyQuiz/demoMode';

// Standalone preview of the Weekly Quiz — no feed, just the quiz modal over a
// blank page, running on sample/mock data (demo mode). Closing it (X) resets
// the run and reopens so it can be replayed freely. Temporary preview route.
function WeeklyQuizPreviewPage(): ReactElement {
  const [mounted, setMounted] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const { resetPlayed } = useWeeklyQuizPlayed(sampleWeeklyQuiz.id);

  // Client-only: enable demo before the modal's hooks read it, then render.
  useEffect(() => {
    enableWeeklyQuizDemo();
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    resetPlayed();
    setRunKey((key) => key + 1);
  }, [resetPlayed]);

  return (
    <>
      <NextSeo title="Weekly Quiz preview" nofollow noindex />
      {mounted && (
        <WeeklyQuizModal
          key={runKey}
          isOpen
          onRequestClose={handleClose}
          // No feed behind it here, so top-align instead of vertically centering
          // to avoid a big empty gap above the quiz on this standalone page.
          overlayClassName="!justify-start pt-6 tablet:pt-10"
        />
      )}
    </>
  );
}

export default WeeklyQuizPreviewPage;
