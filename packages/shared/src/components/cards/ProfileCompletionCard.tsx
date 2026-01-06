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
    },
    {
      label: 'Headline',
      completed: completion.hasHeadline,
      redirectPath: `${webappUrl}settings/profile?field=bio`,
    },
    {
      label: 'Experience level',
      completed: completion.hasExperienceLevel,
      redirectPath: `${webappUrl}settings/profile?field=experienceLevel`,
    },
    {
      label: 'Work experience',
      completed: completion.hasWork,
      redirectPath: `${webappUrl}settings/profile/experience/work`,
    },
    {
      label: 'Education',
      completed: completion.hasEducation,
      redirectPath: `${webappUrl}settings/profile/experience/education`,
    },
  ];
};

const profileCompletionCardBorder =
  '1px solid var(--theme-accent-cabbage-default)';

const profileCompletionCardBg =
  'linear-gradient(180deg, rgba(61, 179, 158, 0.16) 0%, rgba(61, 179, 158, 0.08) 50%, rgba(61, 179, 158, 0.04) 100%)';

const profileCompletionButtonBg = 'var(--theme-accent-cabbage-default)';

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

  const nextSectionText = `Add your ${firstIncompleteItem.label.toLowerCase()} to improve your profile visibility.`;

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
          {nextSectionText}
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
          Update your profile
        </Button>
      </div>
    </div>
  );
};

export default ProfileCompletionCard;
