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

export function FeedbackWidget(): ReactElement | null {
  const { user } = useAuthContext();
  const { showFeedbackButton } = useSettingsContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { openModal } = useLazyModal();
  const dailyTrio = useMemo(getDailyTrio, []);
  const [isCompact, setIsCompact] = useState(false);

  const isVisible = !!user && !isMobile && showFeedbackButton;

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

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      className="group fixed bottom-4 right-4 z-max !h-auto !gap-0 !px-3 py-1.5 shadow-2"
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
