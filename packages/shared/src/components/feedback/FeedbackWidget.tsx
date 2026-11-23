import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { getDayOfYear } from 'date-fns';
import { Button, ButtonVariant, ButtonSize } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { TEAM_MEMBERS } from '../../lib/team';

interface FeedbackWidgetProps {
  // `fixed` (default) — floating bottom-right pill (legacy/v1 chrome).
  // `sidebar` — inline button rendered inside the v2 expanded sidebar
  // panel.
  // `support` — same inline button rendered inside the v2 rail support
  // popover; not gated by `showFeedbackButton` so it stays reachable after
  // the user hides the button in settings.
  placement?: 'fixed' | 'sidebar' | 'support';
}

const getDailyTrio = (): ReadonlyArray<(typeof TEAM_MEMBERS)[number]> => {
  const dayOfYear = getDayOfYear(new Date());
  const len = TEAM_MEMBERS.length;
  return [0, 1, 2].map((i) => TEAM_MEMBERS[(dayOfYear + i) % len]);
};

export function FeedbackWidget({
  placement = 'fixed',
}: FeedbackWidgetProps = {}): ReactElement | null {
  const { user } = useAuthContext();
  const { showFeedbackButton } = useSettingsContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { openModal } = useLazyModal();
  const dailyTrio = useMemo(getDailyTrio, []);
  const [isCompact, setIsCompact] = useState(false);

  // Only show for authenticated users on desktop. The fixed/sidebar
  // variants are additionally gated by the `showFeedbackButton` setting;
  // the support variant lives inside the rail support popover and is
  // always reachable so users can re-open the widget after hiding it
  // in settings.
  const isSupport = placement === 'support';
  const isSidebar = placement === 'sidebar';
  const isInline = isSupport || isSidebar;
  const isVisible = !!user && !isMobile && (isSupport || showFeedbackButton);

  useEffect(() => {
    if (!isVisible || isInline) {
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
  }, [isVisible, isInline]);

  if (!isVisible) {
    return null;
  }

  if (isInline) {
    return (
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        className="group !h-auto w-full justify-between !gap-0 border border-border-subtlest-tertiary !bg-transparent !px-3 py-2 !text-text-secondary shadow-none hover:!bg-surface-hover hover:!text-text-primary"
        onClick={() => openModal({ type: LazyModal.Feedback })}
        aria-label="Send feedback. Real people reply."
        aria-keyshortcuts="Control+Shift+F Meta+Shift+F"
      >
        <span className="flex min-w-0 flex-col items-start overflow-hidden whitespace-nowrap leading-tight">
          <span>Feedback</span>
          <span className="font-normal typo-caption2">Real people reply</span>
        </span>
        <span className="ml-3 flex shrink-0">
          {dailyTrio.map((member, index) => (
            <ProfilePicture
              key={member.username}
              user={member}
              size={ProfileImageSize.Small}
              className={classNames(
                'border-2 border-background-default group-hover:border-surface-hover',
                index !== 0 && '-ml-3',
              )}
            />
          ))}
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      // `--sponsor-strip-height` is set only while the sponsor strip is docked
      // (see `sponsorStripOffset`), so this is the usual 1rem everywhere else.
      className="group fixed bottom-[calc(1rem_+_var(--sponsor-strip-height,0px))] right-4 z-max !h-auto !gap-0 !px-3 py-1.5 shadow-2 [&[inert]]:hidden [[inert]_&]:hidden"
      onClick={() => openModal({ type: LazyModal.Feedback })}
      aria-label="Send feedback. Real people reply."
      aria-keyshortcuts="Control+Shift+F Meta+Shift+F"
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
        <span className="font-normal typo-caption2">Real people reply</span>
      </span>
      <span className="flex">
        {dailyTrio.map((member, index) => (
          <ProfilePicture
            key={member.username}
            user={member}
            size={ProfileImageSize.Medium}
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
