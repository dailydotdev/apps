import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { getDayOfYear } from 'date-fns';
import { Button, ButtonVariant, ButtonSize } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useLogContext } from '../../contexts/LogContext';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { useCustomizeNewTab } from '../../features/customizeNewTab/CustomizeNewTabContext';
import { IconSize } from '../Icon';
import { MiniCloseIcon } from '../icons';
import { LogEvent, TargetType } from '../../lib/log';

interface FeedbackWidgetProps {
  placement?: 'fixed' | 'sidebar' | 'support';
}

const TEAM_MEMBERS = [
  {
    username: 'idoshamun',
    name: 'Ido Shamun',
    image:
      'https://media.daily.dev/image/upload/s---xy_OAwk--/f_auto,q_auto/v1703781380/avatars/avatar_28849d86070e4c099c877ab6837c61f0',
  },
  {
    username: 'kramer',
    name: 'Nimrod Kramer',
    image:
      'https://media.daily.dev/image/upload/v1682322243/avatars/avatar_1d339aa5b85c4e0ba85fdedb523c48d4.jpg',
  },
  {
    username: 'amar',
    name: 'Amar',
    image:
      'https://media.daily.dev/image/upload/s--W1oZyHsz--/f_auto/v1719829173/avatars/avatar_0pjeBcFKQqsnU97ZOj9EW',
  },
  {
    username: 'capjavert',
    name: 'Ante Barić',
    image:
      'https://media.daily.dev/image/upload/v1679300599/avatars/avatar_LJSkpBexOSCWc8INyu3Eu.jpg',
  },
  {
    username: 'dailydevtips',
    name: 'Chris Bongers',
    image:
      'https://media.daily.dev/image/upload/s--9gxFz1e7--/f_auto/v1705902590/avatars/avatar_JUNiIGCV-?_a=BAMAMiZW0',
  },
  {
    username: 'tsahimatsliah',
    name: 'Tsahi Matsliah',
    image:
      'https://media.daily.dev/image/upload/s--k80T3WJe--/f_auto,q_auto/v1703793130/avatars/avatar_5e0af68445e04c02b0656c3530664aff',
  },
  {
    username: 'dave28',
    name: 'Dave',
    image:
      'https://media.daily.dev/image/upload/s--C7nUVtfM--/f_auto,q_auto/v1/avatars/avatar_14yFjmSDxLUrr05G27mp6',
  },
  {
    username: 'vasn',
    name: 'Vas N',
    image:
      'https://lh3.googleusercontent.com/a-/AOh14GhZpI6rlti8BFP-fzWGDxrFlAmSfb72Vd6u7XS5=s100',
  },
] as const;

const getDailyTrio = (): ReadonlyArray<(typeof TEAM_MEMBERS)[number]> => {
  const dayOfYear = getDayOfYear(new Date());
  const len = TEAM_MEMBERS.length;
  return [0, 1, 2].map((i) => TEAM_MEMBERS[(dayOfYear + i) % len]);
};

export function FeedbackWidget({
  placement = 'fixed',
}: FeedbackWidgetProps): ReactElement | null {
  const { user } = useAuthContext();
  const { showFeedbackButton, toggleShowFeedbackButton } = useSettingsContext();
  const { logEvent } = useLogContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { openModal } = useLazyModal();
  const dailyTrio = useMemo(getDailyTrio, []);
  const [isCompact, setIsCompact] = useState(false);

  const { panelWidth } = useCustomizeNewTab();
  // Only show for authenticated users on desktop. The sidebar variant is
  // additionally gated by the `showFeedbackButton` setting; the support-menu
  // variant is always available so users can re-open the widget after
  // dismissing it from the sidebar.
  const isSupport = placement === 'support';
  const isSidebar = placement === 'sidebar';
  const isVisible =
    !!user && !isMobile && (isSupport || showFeedbackButton);

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }
    const callback = () => {
      setIsCompact(
        document.documentElement.scrollTop >= window.innerHeight / 2,
      );
    };
    callback();
    window.addEventListener('scroll', callback, { passive: true });
    return () => window.removeEventListener('scroll', callback);
  }, [isVisible]);

  const onHideFeedbackButton = useCallback(() => {
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.FeedbackButton,
      target_id: 'hide',
    });
    return toggleShowFeedbackButton();
  }, [logEvent, toggleShowFeedbackButton]);

  if (!isVisible) {
    return null;
  }

  if (isSidebar || isSupport) {
    return (
      <div className="group/feedback relative">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          className="group !h-auto w-full justify-between !gap-0 border border-border-subtlest-tertiary !bg-transparent !px-3 py-2 !text-text-secondary shadow-none hover:!bg-surface-hover hover:!text-text-primary"
          onClick={() => openModal({ type: LazyModal.Feedback })}
          aria-label="Send feedback. Real people reply."
        >
          <span className="flex min-w-0 flex-col items-start overflow-hidden whitespace-nowrap leading-tight">
            <span>Feedback</span>
            <span className="opacity-80 font-normal typo-caption2">
              Real people reply
            </span>
          </span>
          <span className="ml-3 flex shrink-0">
            {dailyTrio.map((member, index) => (
              <ProfilePicture
                key={member.username}
                user={member}
                size={ProfileImageSize.Small}
                rounded="full"
                className={classNames(
                  'border-2 border-background-default group-hover:border-surface-hover',
                  index !== 0 && '-ml-3',
                )}
              />
            ))}
          </span>
        </Button>

        {isSidebar && (
          <button
            type="button"
            onClick={onHideFeedbackButton}
            aria-label="Hide feedback button"
            className="focus-outline pointer-events-none absolute right-0 top-0 z-1 flex size-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-8 border border-border-subtlest-tertiary bg-accent-pepper-subtlest text-text-tertiary opacity-0 shadow-2 transition hover:bg-surface-hover hover:text-text-primary group-hover/feedback:pointer-events-auto group-hover/feedback:opacity-100"
          >
            <MiniCloseIcon size={IconSize.XSmall} aria-hidden />
          </button>
        )}
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      className="group fixed bottom-4 z-max !h-auto !gap-0 !px-3 py-1.5 shadow-2"
      style={{
        // Slide left of the customize sidebar while it's open so the pill
        // stays clear of the panel; transition matches the panel + header
        // 200ms ease-in-out so all the right-anchored chrome moves in sync.
        right: `calc(1rem + ${panelWidth}px)`,
        transition: 'right 200ms ease-in-out',
      }}
      onClick={() => openModal({ type: LazyModal.Feedback })}
      aria-label="Send feedback. Real people reply."
    >
      <span
        aria-hidden={isCompact}
        className={classNames(
          'flex flex-col items-start overflow-hidden whitespace-nowrap leading-tight transition-all duration-300 ease-out',
          isCompact
            ? 'max-w-0 opacity-0 group-hover:mr-3 group-hover:max-w-40 group-hover:opacity-100'
            : 'mr-3 max-w-40 opacity-100',
        )}
      >
        <span>Feedback</span>
        <span className="opacity-80 font-normal typo-caption2">
          Real people reply
        </span>
      </span>
      <span className="flex">
        {dailyTrio.map((member, index) => (
          <ProfilePicture
            key={member.username}
            user={member}
            size={ProfileImageSize.Medium}
            rounded="full"
            className={classNames(
              'border-2 border-text-primary',
              index !== 0 && '-ml-4',
            )}
          />
        ))}
      </span>
    </Button>
  );
}

export default FeedbackWidget;
