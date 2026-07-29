import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import CloseButton from '../../../components/CloseButton';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureWeeklyQuiz } from '../../../lib/featureManagement';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import usePersistentContext from '../../../hooks/usePersistentContext';
import { useWeeklyQuizStatus } from '../hooks/useWeeklyQuizStatus';
import styles from '../WeeklyQuiz.module.css';

interface WeeklyQuizBannerProps {
  className?: string;
}

// The feed banner that invites developers into the week's quiz. It's gated by
// the GrowthBook flag AND the server-controlled availability window
// (status.isActive, the last-two-days schedule), and it's dismissible per week
// so it can return next week. Rendered in the feed's in-flow promo slot.
export const WeeklyQuizBanner = ({
  className,
}: WeeklyQuizBannerProps): ReactElement | null => {
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();
  const { status } = useWeeklyQuizStatus();
  const isActive = !!status?.isActive;

  const { value: isEnabled } = useConditionalFeature({
    feature: featureWeeklyQuiz,
    shouldEvaluate: isActive,
  });

  // Dismissal is keyed by the active quiz so it resets each week.
  const dismissKey = status?.activeQuizId
    ? `weekly_quiz_banner_dismissed:${status.activeQuizId}`
    : 'weekly_quiz_banner_dismissed';
  const [isDismissed, setIsDismissed, isDismissFetched] =
    usePersistentContext<boolean>(dismissKey, false);

  const shouldShow = isActive && isEnabled && !isDismissed && isDismissFetched;

  useEffect(() => {
    if (!shouldShow) {
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.WeeklyQuiz,
    });
    // logEvent identity is stable; re-log only when visibility flips on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShow]);

  if (!shouldShow) {
    return null;
  }

  const hasPlayed = status?.hasCompletedThisWeek;

  const handleCtaClick = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.WeeklyQuiz,
    });
    openModal({ type: LazyModal.WeeklyQuiz });
  };

  return (
    <section
      className={classNames(
        'relative flex items-center gap-4 overflow-hidden rounded-16 px-4 py-4 pr-10',
        styles.banner,
        className,
      )}
    >
      <span className={styles.rays} aria-hidden />
      <span className="bg-white/15 flex h-14 w-14 shrink-0 items-center justify-center rounded-16 text-3xl">
        🎮
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col">
          <Typography
            type={TypographyType.Footnote}
            bold
            className="!text-white/80 uppercase tracking-wide"
          >
            Weekly quiz
          </Typography>
          <Typography type={TypographyType.Body} bold className="!text-white">
            {hasPlayed
              ? 'You already played — see how you rank!'
              : 'This week in tech news — were you paying attention?'}
          </Typography>
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Avocado}
          size={ButtonSize.Small}
          className="w-fit"
          onClick={handleCtaClick}
        >
          {hasPlayed ? 'View scoreboard' : "Let's play"}
        </Button>
      </div>
      <CloseButton
        type="button"
        size={ButtonSize.XSmall}
        className="absolute right-2 top-2 text-white"
        aria-label="Close banner"
        onClick={() => setIsDismissed(true)}
      />
    </section>
  );
};
