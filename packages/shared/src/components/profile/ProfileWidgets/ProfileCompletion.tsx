import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
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

export type CompletionItem = {
  label: string;
  completed: boolean;
};

type ProfileCompletionProps = {
  className?: string;
  user: LoggedUser | PublicProfile;
  onClick: () => void;
};

const getCompletionItems = (
  user: LoggedUser | PublicProfile,
): CompletionItem[] => {
  const hasProfileImage = !!user.image && user.image !== '';
  const hasHeading = !!user.bio && user.bio.trim() !== '';
  const hasExperienceLevel = !!(user as LoggedUser).experienceLevel;
  const hasWorkExperience = !!user.companies && user.companies.length > 0;
  const hasEducation = !!user.companies && user.companies.length > 0; // TODO: Update when education field is available

  return [
    { label: 'Profile image', completed: hasProfileImage },
    { label: 'Heading', completed: hasHeading },
    { label: 'Experience level', completed: hasExperienceLevel },
    { label: 'Work experience', completed: hasWorkExperience },
    { label: 'Education', completed: hasEducation },
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
  onClick,
}: ProfileCompletionProps): ReactElement => {
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

  const isCompleted = progress === 100;
  // TODO: We might need some action here to not show it anymore?
  if (isCompleted) {
    return null;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
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
