import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import type { ModalProps } from '../../../components/modals/common/Modal';
import { Modal } from '../../../components/modals/common/Modal';
import { usePrompt } from '../../../hooks/usePrompt';
import { useWeeklyQuizStatus } from '../hooks/useWeeklyQuizStatus';
import { useWeeklyQuiz } from '../hooks/useWeeklyQuiz';
import { useWeeklyQuizGame, WeeklyQuizPhase } from '../hooks/useWeeklyQuizGame';
import { useWeeklyQuizAudio } from '../hooks/useWeeklyQuizAudio';
import { useWeeklyQuizPlayed } from '../hooks/useWeeklyQuizPlayed';
import { WeeklyQuizIntro, WeeklyQuizDateChip } from './WeeklyQuizIntro';
import { WeeklyQuizCountdown } from './WeeklyQuizCountdown';
import { WeeklyQuizQuestion } from './WeeklyQuizQuestion';
import { WeeklyQuizResults } from './WeeklyQuizResults';
import { WeeklyQuizSideControls } from './WeeklyQuizSideControls';
import { WeeklyQuizSurface } from './WeeklyQuizSurface';

// The Weekly Quiz overlay: an intro (welcome text + scoreboard + start), a
// 3-2-1 countdown, the stepped question flow, and the results. State lives in
// useWeeklyQuizGame; audio (looping music + countdown beeps) lives in
// useWeeklyQuizAudio, shared across phases and toggled by the header button.
function WeeklyQuizModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const { status } = useWeeklyQuizStatus();
  const quizId = status?.activeQuizId;
  const { quiz, isPending } = useWeeklyQuiz(quizId);
  const game = useWeeklyQuizGame(quiz);
  const audio = useWeeklyQuizAudio();
  const { showPrompt } = usePrompt();
  const { hasPlayed, markPlayed } = useWeeklyQuizPlayed(quizId);

  const { phase } = game;
  const { startMusic, stopMusic } = audio;
  // The quiz is live once the player leaves the intro (countdown + questions).
  const isInProgress =
    phase === WeeklyQuizPhase.Countdown || phase === WeeklyQuizPhase.Question;
  // A one-shot per week: the server flag, or the local commitment we persist the
  // moment they start. Either one locks the intro's Start button.
  const alreadyPlayed = hasPlayed || !!status?.hasCompletedThisWeek;

  // Background music is lobby ambiance: it plays on the intro and results
  // screens (autoplay is allowed — the modal opens from a click) and stops
  // during the countdown + questions so gameplay sound effects aren't competing
  // with the loop. The modal unmount fully releases it (handled in
  // useWeeklyQuizAudio).
  useEffect(() => {
    if (phase === WeeklyQuizPhase.Intro || phase === WeeklyQuizPhase.Results) {
      startMusic();
    } else {
      stopMusic();
    }
  }, [phase, startMusic, stopMusic]);

  // Spend the attempt as soon as the player commits (leaves the intro). Persists
  // right away, so a refresh mid-quiz can't hand them a fresh run.
  useEffect(() => {
    if (phase !== WeeklyQuizPhase.Intro) {
      markPlayed();
    }
  }, [phase, markPlayed]);

  // Guard a page refresh / tab close while the quiz is live with the browser's
  // native "leave site?" prompt. The attempt is already spent, so leaving just
  // means forfeiting the run.
  useEffect(() => {
    if (!isInProgress) {
      return undefined;
    }
    const handler = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
      // Required for Chrome to actually show the native leave prompt.
      // eslint-disable-next-line no-param-reassign
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isInProgress]);

  // Intercept every in-app close route (X, Esc, overlay) while the quiz is live
  // to confirm the player really means to forfeit their one run. Void-returning
  // so it drops straight into onRequestClose / onClick handler slots.
  const handleRequestClose = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent): void => {
      if (!isInProgress) {
        onRequestClose?.(event);
        return;
      }
      showPrompt({
        title: 'Leave the quiz?',
        description:
          "You only get one run this week. If you leave now your quiz is over — you won't be able to start it again.",
        okButton: { title: 'Leave quiz' },
        cancelButton: { title: 'Keep playing' },
      }).then((confirmed) => {
        if (confirmed) {
          onRequestClose?.(event);
        }
      });
    },
    [isInProgress, onRequestClose, showPrompt],
  );

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XLarge}
      // The welcome screen is roomier (768px) for its two-panel layout; every
      // other screen is 640px. The surface brings its own gradient/rounding, so
      // strip the Modal's default dark background/border/shadow — otherwise it
      // frames the surface in a black box.
      className={`force-dark !border-0 !bg-transparent !shadow-none ${
        phase === WeeklyQuizPhase.Intro
          ? 'tablet:!w-[768px]'
          : 'tablet:!w-[640px]'
      }`}
      onRequestClose={handleRequestClose}
      isDrawerOnMobile
    >
      <div className="flex w-full items-start justify-center gap-3">
        <WeeklyQuizSurface
          showRays={
            phase !== WeeklyQuizPhase.Intro && phase !== WeeklyQuizPhase.Results
          }
          headerRight={
            phase === WeeklyQuizPhase.Intro && quiz ? (
              <WeeklyQuizDateChip
                startDate={quiz.startDate}
                endDate={quiz.endDate}
              />
            ) : undefined
          }
        >
          {phase === WeeklyQuizPhase.Intro && (
            <WeeklyQuizIntro
              quiz={quiz}
              isLoading={isPending}
              onStart={game.beginCountdown}
              alreadyPlayed={alreadyPlayed}
            />
          )}
          {phase === WeeklyQuizPhase.Countdown && (
            <WeeklyQuizCountdown
              onComplete={game.start}
              onTick={audio.playCountdownTick}
            />
          )}
          {phase === WeeklyQuizPhase.Question && (
            <WeeklyQuizQuestion game={game} audio={audio} />
          )}
          {phase === WeeklyQuizPhase.Results && game.result && quizId && (
            <WeeklyQuizResults
              quizId={quizId}
              result={game.result}
              audio={audio}
            />
          )}
        </WeeklyQuizSurface>
        <WeeklyQuizSideControls
          level={audio.level}
          onCycleSound={audio.cycleLevel}
          onClose={handleRequestClose}
        />
      </div>
    </Modal>
  );
}

export default WeeklyQuizModal;
