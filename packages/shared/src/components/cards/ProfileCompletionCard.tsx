import React, { useMemo } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import ProgressCircle from '../ProgressCircle';
import { useAuthContext } from '../../contexts/AuthContext';
import type { ProfileCompletion } from '../../lib/user';
import { webappUrl } from '../../lib/constants';

type CompletionItem = {
  label: string;
  completed: boolean;
  redirectPath: string;
  cta: string;
  benefit: string;
};

type ProfileCompletionCardProps = {
  className?: Partial<{
    container: string;
    card: string;
  }>;
};

const getCompletionItems = (
  completion: ProfileCompletion,
): CompletionItem[] => {
  return [
    {
      label: 'Profile image',
      completed: completion.hasProfileImage,
      redirectPath: `${webappUrl}settings/profile`,
      cta: 'Add profile image',
      benefit:
        'Stand out in comments and discussions. Profiles with photos get more engagement.',
    },
    {
      label: 'Headline',
      completed: completion.hasHeadline,
      redirectPath: `${webappUrl}settings/profile?field=bio`,
      cta: 'Write your headline',
      benefit:
        'Tell the community who you are. A good headline helps others connect with you.',
    },
    {
      label: 'Experience level',
      completed: completion.hasExperienceLevel,
      redirectPath: `${webappUrl}settings/profile?field=experienceLevel`,
      cta: 'Set experience level',
      benefit:
        'Get personalized content recommendations based on where you are in your career.',
    },
    {
      label: 'Work experience',
      completed: completion.hasWork,
      redirectPath: `${webappUrl}settings/profile/experience/work`,
      cta: 'Add work experience',
      benefit:
        'Showcase your background and unlock opportunities from companies looking for talent like you.',
    },
    {
      label: 'Education',
      completed: completion.hasEducation,
      redirectPath: `${webappUrl}settings/profile/experience/education`,
      cta: 'Add education',
      benefit:
        'Complete your story. Education helps others understand your journey.',
    },
  ];
};

// Using softer, less saturated purple tones that align with the brand
const profileCompletionCardBorder =
  '1px solid color-mix(in srgb, var(--theme-accent-cabbage-subtler), transparent 50%)';

const profileCompletionCardBg =
  'linear-gradient(180deg, color-mix(in srgb, var(--theme-accent-cabbage-bolder), transparent 92%) 0%, color-mix(in srgb, var(--theme-accent-cabbage-bolder), transparent 96%) 100%)';

const profileCompletionButtonBg =
  'color-mix(in srgb, var(--theme-accent-cabbage-default), transparent 20%)';

export const ProfileCompletionCard = ({
  className,
}: ProfileCompletionCardProps): ReactElement | null => {
  const { user } = useAuthContext();
  const profileCompletion = user?.profileCompletion;

  const items = useMemo(
    () => (profileCompletion ? getCompletionItems(profileCompletion) : []),
    [profileCompletion],
  );

  const incompleteItems = useMemo(
    () => items.filter((item) => !item.completed),
    [items],
  );

  const firstIncompleteItem = incompleteItems[0];
  const progress = profileCompletion?.percentage ?? 0;
  const isCompleted = progress === 100;

  if (!profileCompletion || isCompleted || !firstIncompleteItem) {
    return null;
  }

  return (
    <div
      className={classNames('flex flex-1 p-2 laptop:p-0', className?.container)}
    >
      <div
        style={{
          border: profileCompletionCardBorder,
          background: profileCompletionCardBg,
        }}
        className={classNames(
          'flex flex-1 flex-col gap-4 rounded-16 px-6 py-4',
          'backdrop-blur-3xl',
          className?.card,
        )}
      >
        <ProgressCircle progress={progress} size={48} showPercentage />
        <Typography
          type={TypographyType.Title2}
          color={TypographyColor.Primary}
          bold
        >
          Profile completion
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {firstIncompleteItem.benefit}
        </Typography>
        <Button
          style={{
            background: profileCompletionButtonBg,
          }}
          className="mt-auto w-full"
          tag="a"
          href={firstIncompleteItem.redirectPath}
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
        >
          {firstIncompleteItem.cta}
        </Button>
      </div>
    </div>
  );
};

export default ProfileCompletionCard;
