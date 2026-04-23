import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../../contexts/AuthContext';
import { getFirstName } from '../../../lib/user';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { useFocusMode } from '../store/focusMode.store';

const getTimeSalutation = (date: Date = new Date()): string => {
  const hour = date.getHours();
  if (hour < 5) {
    return 'Still up';
  }
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
};

// Reveal-on-scroll threshold in px. Small enough that any intentional scroll
// triggers it, large enough that the hero doesn't vanish from a trackpad jitter.
const REVEAL_THRESHOLD_PX = 160;

interface FocusModeGreetingProps {
  className?: string;
}

export const FocusModeGreeting = ({
  className,
}: FocusModeGreetingProps): ReactElement | null => {
  const { user } = useAuthContext();
  const { isEnabled, isRevealed, setRevealed } = useFocusMode();

  const firstName = useMemo(
    () => (user?.name ? getFirstName(user.name) : undefined),
    [user?.name],
  );

  // Wait for the user to scroll intentionally before revealing the rest of
  // the UI. Runs only while focus mode is on and not yet revealed, so the
  // listener is short-lived.
  useEffect(() => {
    if (!isEnabled || isRevealed) {
      return undefined;
    }

    const onScroll = () => {
      if (window.scrollY > REVEAL_THRESHOLD_PX) {
        setRevealed(true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isEnabled, isRevealed, setRevealed]);

  if (!isEnabled || isRevealed) {
    return null;
  }

  const salutation = getTimeSalutation();
  const title = firstName ? `${salutation}, ${firstName}.` : `${salutation}.`;

  return (
    <section
      aria-label="Focus mode greeting"
      className={classNames(
        'flex flex-col items-center gap-2 py-12 text-center tablet:py-16',
        className,
      )}
    >
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.LargeTitle}
        bold
        className="text-balance"
      >
        {title}
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="max-w-md text-balance"
      >
        Here&apos;s a short list of posts worth your attention. Scroll when you
        want the full feed.
      </Typography>
    </section>
  );
};
