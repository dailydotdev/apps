import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { RootPortal } from '../tooltips/Portal';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreakSummary } from '../../hooks/streaks/useReadingStreakSummary';
import {
  useQuestDashboard,
  useClaimableQuestCount,
} from '../../hooks/useQuestDashboard';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { ReadingStreakIcon } from '../icons';
import { IconSize } from '../Icon';
import { Bubble } from '../tooltips/utils';
import CloseButton from '../CloseButton';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import Link from '../utilities/Link';
import { webappUrl } from '../../lib/constants';
import { ReadingStreakPopup } from './popup/ReadingStreakPopup';
import { getQuestStatusLabel } from '../quest/QuestCard';
import type { UserQuest } from '../../graphql/quests';

const CLOSE_MS = 300;
const gameCenterUrl = `${webappUrl}daily-quests`;

const QuestRow = ({ userQuest }: { userQuest: UserQuest }): ReactElement => {
  const { quest, progress, claimable } = userQuest;
  return (
    <div
      className={classNames(
        'flex items-center gap-3 rounded-12 border p-3',
        claimable
          ? 'border-accent-bacon-default bg-accent-bacon-subtlest'
          : 'border-border-subtlest-tertiary',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography type={TypographyType.Footnote} bold truncate>
          {quest.name}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={claimable ? TypographyColor.Brand : TypographyColor.Quaternary}
        >
          {getQuestStatusLabel(userQuest)} · {progress}/{quest.targetCount}
        </Typography>
      </div>
    </div>
  );
};

// Option 2: a right-side "progress" drawer holding both the reading streak and
// quests, reachable on every page via an always-visible edge tab. The tab is
// the only persistent pixel — the panel itself slides in on demand, so the
// content never loses width.
export const ActivityDock = (): ReactElement | null => {
  const { user } = useAuthContext();
  const {
    isEnabled: isStreakEnabled,
    streak,
    count: streakCount,
    hasReadToday,
  } = useReadingStreakSummary();
  const { data: dashboard } = useQuestDashboard();
  const claimableCount = useClaimableQuestCount();
  const { logEvent } = useLogContext();

  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const open = useCallback(() => {
    logEvent({ event_name: LogEvent.OpenStreaks });
    setIsOpen(true);
  }, [logEvent]);

  const close = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), CLOSE_MS);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const raf = requestAnimationFrame(() => setIsVisible(true));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, close]);

  if (!user || (!isStreakEnabled && !dashboard)) {
    return null;
  }

  const dailyQuests = dashboard?.daily?.regular ?? [];

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Open your progress"
        aria-haspopup="dialog"
        className="focus-outline fixed right-0 top-1/2 z-header hidden -translate-y-1/2 flex-col items-center gap-1 rounded-l-16 border border-r-0 border-border-subtlest-tertiary bg-background-default py-3 pl-2.5 pr-2 shadow-2 transition-[padding] hover:pr-3 laptop:flex"
      >
        <ReadingStreakIcon
          secondary={hasReadToday}
          size={IconSize.Small}
          className="text-accent-bacon-default"
        />
        <Typography
          type={TypographyType.Caption1}
          bold
          className="tabular-nums"
        >
          {streakCount}
        </Typography>
        {claimableCount > 0 && (
          <Bubble className="-right-1 -top-1 px-1">{claimableCount}</Bubble>
        )}
      </button>

      {isOpen && (
        <RootPortal>
          <div
            role="presentation"
            onClick={close}
            className={classNames(
              'fixed inset-0 z-modal bg-overlay-quaternary-onion transition-opacity duration-300',
              isVisible ? 'opacity-100' : 'opacity-0',
            )}
          />
          <aside
            role="dialog"
            aria-label="Your progress"
            className={classNames(
              'fixed inset-y-0 right-0 z-modal flex w-[22rem] max-w-[100vw] flex-col border-l border-border-subtlest-tertiary bg-background-default shadow-3 transition-transform duration-300 ease-in-out',
              isVisible ? 'translate-x-0' : 'translate-x-full',
            )}
          >
            <header className="flex items-center justify-between border-b border-border-subtlest-tertiary px-4 py-3">
              <Typography bold type={TypographyType.Title3}>
                Your progress
              </Typography>
              <CloseButton size={ButtonSize.Small} onClick={close} />
            </header>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {isStreakEnabled && streak && (
                <section>
                  <ReadingStreakPopup streak={streak} fullWidth />
                </section>
              )}

              {dailyQuests.length > 0 && (
                <section className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Typography bold type={TypographyType.Body}>
                      Daily quests
                    </Typography>
                    {claimableCount > 0 && (
                      <Typography
                        type={TypographyType.Caption1}
                        bold
                        color={TypographyColor.Brand}
                      >
                        {claimableCount} to claim
                      </Typography>
                    )}
                  </div>
                  {dailyQuests.map((userQuest) => (
                    <QuestRow
                      key={userQuest.rotationId}
                      userQuest={userQuest}
                    />
                  ))}
                  <Link href={gameCenterUrl} passHref>
                    <Button
                      tag="a"
                      onClick={close}
                      variant={ButtonVariant.Float}
                      size={ButtonSize.Small}
                      className="mt-1"
                    >
                      Open Game Center
                    </Button>
                  </Link>
                </section>
              )}
            </div>
          </aside>
        </RootPortal>
      )}
    </>
  );
};
