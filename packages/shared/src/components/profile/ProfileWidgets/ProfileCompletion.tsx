import type { ReactElement } from 'react';
import React, { useMemo, useCallback, useEffect } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import ProgressCircle from '../../ProgressCircle';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import { MoveToIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { getPercentage } from '../../../lib/func';
import type { LoggedUser, PublicProfile } from '../../../lib/user';
import { webappUrl } from '../../../lib/constants';
import { useToastNotification, useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';

export type CompletionItem = {
  label: string;
  completed: boolean;
  redirectPath: string;
};

type ProfileCompletionProps = {
  className?: string;
  user: LoggedUser | PublicProfile;
};

const getCompletionItems = (
  user: LoggedUser | PublicProfile,
): CompletionItem[] => {
  const hasProfileImage = !!user.image && user.image !== '';
  const hasHeadline = !!user.bio && user.bio.trim() !== '';
  const hasExperienceLevel = !!user.experienceLevel;
  const hasWorkExperience = !!user.companies && user.companies.length > 0; // TODO: Update when work experience field is available
  const hasEducation = !!user.companies && user.companies.length > 0; // TODO: Update when education field is available

  return [
    {
      label: 'Profile image',
      completed: hasProfileImage,
      redirectPath: `${webappUrl}/settings/profile`,
    },
    {
      label: 'Headline',
      completed: hasHeadline,
      redirectPath: `${webappUrl}/settings/profile`,
    },
    {
      label: 'Experience level',
      completed: hasExperienceLevel,
      redirectPath: `${webappUrl}/settings/profile`,
    },
    {
      label: 'Work experience',
      completed: hasWorkExperience,
      redirectPath: `${webappUrl}/settings/profile`, // TODO: Update to /settings/experience when available
    },
    {
      label: 'Education',
      completed: hasEducation,
      redirectPath: `${webappUrl}/settings/profile`, // TODO: Update to /settings/experience when available
    },
  ];
};

const formatDescription = (incompleteItems: CompletionItem[]): string => {
  if (incompleteItems.length === 0) {
    return 'Profile completed!';
  }

  const labels = incompleteItems.map((item) => item.label);
  const formattedList =
    labels.length === 1
      ? labels[0]
      : `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;

  return `Add ${formattedList}.`;
};

export const ProfileCompletion = ({
  className,
  user,
}: ProfileCompletionProps): ReactElement => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { completeAction, checkHasCompleted } = useActions();
  const items = useMemo(() => getCompletionItems(user), [user]);

  const { progress, incompleteItems } = useMemo(() => {
    const completedCount = items.filter((item) => item.completed).length;
    const incomplete = items.filter((item) => !item.completed);

    return {
      progress: getPercentage(items.length, completedCount),
      incompleteItems: incomplete,
    };
  }, [items]);

  const description = useMemo(
    () => formatDescription(incompleteItems),
    [incompleteItems],
  );

  const handleClick = useCallback(() => {
    // Find the first incomplete item in order of priority
    const firstIncompleteItem = incompleteItems[0];
    if (firstIncompleteItem?.redirectPath) {
      router.push(firstIncompleteItem.redirectPath);
    }
  }, [incompleteItems, router]);

  const isCompleted = progress === 100;
  const hasCompletedAction = checkHasCompleted(ActionType.ProfileCompleted);

  useEffect(() => {
    if (isCompleted && !hasCompletedAction) {
      displayToast(
        'Your profile has been completed successfully. All your details are now up to date 🎉',
      );
      completeAction(ActionType.ProfileCompleted);
    }
  }, [isCompleted, hasCompletedAction, displayToast, completeAction]);

  if (isCompleted || hasCompletedAction) {
    return null;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={classNames(
        'flex flex-col gap-6 border border-brand-active bg-brand-float p-4 laptop:rounded-16',
        {
          'cursor-pointer hover:bg-brand-hover': !isCompleted,
        },
        className,
      )}
    >
      <div className="flex w-full gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            bold
          >
            Profile Completion
          </Typography>
          <div className="flex min-w-0 items-center gap-1">
            <MoveToIcon
              size={IconSize.XSmall}
              className="shrink-0 text-text-secondary"
            />
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Secondary}
              truncate
            >
              {description}
            </Typography>
          </div>
        </div>

        <div className="shrink-0">
          <ProgressCircle progress={progress} size={50} showPercentage />
        </div>
      </div>
    </div>
  );
};
