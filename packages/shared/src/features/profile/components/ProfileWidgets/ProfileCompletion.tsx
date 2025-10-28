import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import ProgressCircle from '../../../../components/ProgressCircle';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { MoveToIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { getPercentage } from '../../../../lib/func';
import type { LoggedUser, PublicProfile } from '../../../../lib/user';
import { useActions } from '../../../../hooks';
import { ActionType } from '../../../../graphql/actions';
import Link from '../../../../components/utilities/Link';
import { anchorDefaultRel } from '../../../../lib/strings';

export type CompletionItem = {
  label: string;
  completed: boolean;
  redirectPath: string;
};

type ProfileCompletionProps = {
  className?: string;
  user: LoggedUser | PublicProfile;
};

export const getCompletionItems = (
  user: LoggedUser | PublicProfile | Record<string, unknown>,
): CompletionItem[] => {
  const hasProfileImage = !!user.image && user.image !== '';
  const hasHeadline =
    !!user.bio && typeof user.bio === 'string' && user.bio.trim() !== '';
  const hasExperienceLevel = !!user.experienceLevel;
  const hasWorkExperience =
    !!user.companies &&
    Array.isArray(user.companies) &&
    user.companies.length > 0; // TODO: Update when work experience field is available
  const hasEducation =
    !!user.companies &&
    Array.isArray(user.companies) &&
    user.companies.length > 0; // TODO: Update when education field is available

  return [
    {
      label: 'Profile image',
      completed: hasProfileImage,
      redirectPath: '/settings/profile',
    },
    {
      label: 'Headline',
      completed: hasHeadline,
      redirectPath: '/settings/profile',
    },
    {
      label: 'Experience level',
      completed: hasExperienceLevel,
      redirectPath: '/settings/profile',
    },
    {
      label: 'Work experience',
      completed: hasWorkExperience,
      redirectPath: '/settings/profile', // TODO: Update to /settings/experience when available
    },
    {
      label: 'Education',
      completed: hasEducation,
      redirectPath: '/settings/experience', // TODO: Update when education field is available
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
  const { checkHasCompleted, isActionsFetched } = useActions();
  const items = useMemo(() => getCompletionItems(user), [user]);

  const { progress, incompleteItems } = useMemo(() => {
    const incomplete = items.filter((item) => !item.completed);
    const completedCount = items.length - incomplete.length;

    return {
      progress: getPercentage(items.length, completedCount),
      incompleteItems: incomplete,
    };
  }, [items]);

  const description = useMemo(
    () => formatDescription(incompleteItems),
    [incompleteItems],
  );

  const firstIncompleteItem = incompleteItems[0];
  const redirectPath = firstIncompleteItem?.redirectPath;

  const isCompleted = progress === 100;
  const hasCompletedAction =
    isActionsFetched && checkHasCompleted(ActionType.ProfileCompleted);

  if (isCompleted || hasCompletedAction) {
    return null;
  }

  return (
    <Link href={redirectPath}>
      <a
        href={redirectPath}
        rel={anchorDefaultRel}
        className={classNames(
          'flex cursor-pointer flex-col gap-6 border border-brand-active bg-brand-float p-4 hover:bg-brand-hover laptop:rounded-16',
          className,
        )}
      >
        <div className="flex w-full items-center gap-6">
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

          <div className="flex shrink-0 leading-none">
            <ProgressCircle progress={progress} size={50} showPercentage />
          </div>
        </div>
      </a>
    </Link>
  );
};
