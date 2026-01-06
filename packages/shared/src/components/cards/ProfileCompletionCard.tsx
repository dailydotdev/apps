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
import CloseButton from '../CloseButton';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../../hooks';
import { ActionType } from '../../graphql/actions';
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

export const ProfileCompletionCard = ({
  className,
}: ProfileCompletionCardProps): ReactElement | null => {
  const { user } = useAuthContext();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
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
  const isDismissed =
    isActionsFetched && checkHasCompleted(ActionType.ProfileCompletionCard);

  if (
    !profileCompletion ||
    isCompleted ||
    !firstIncompleteItem ||
    isDismissed
  ) {
    return null;
  }

  const handleDismiss = () => {
    completeAction(ActionType.ProfileCompletionCard);
  };

  return (
    <div
      className={classNames('flex flex-1 p-2 laptop:p-0', className?.container)}
    >
      <div
        className={classNames(
          'relative flex flex-1 flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-6 py-4',
          className?.card,
        )}
      >
        <CloseButton
          className="absolute right-2 top-2"
          size={ButtonSize.XSmall}
          onClick={handleDismiss}
        />
        <ProgressCircle progress={progress} size={48} showPercentage />
        <Typography
          type={TypographyType.Title2}
          color={TypographyColor.Primary}
          bold
        >
          Complete your profile
        </Typography>
        <div className="flex flex-col gap-2">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Finish setting up your profile to get the most out of daily.dev:
          </Typography>
          <ul className="flex list-inside list-disc flex-col gap-1">
            {incompleteItems.map((item) => (
              <li key={item.label}>
                <Typography
                  tag="span"
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  {item.label}
                </Typography>
              </li>
            ))}
          </ul>
        </div>
        <Button
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
