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
import Link from '../../../../components/utilities/Link';
import { anchorDefaultRel } from '../../../../lib/strings';
import { webappUrl } from '../../../../lib/constants';
import { useProfileExperiences } from '../../hooks/useProfileExperiences';
import type {
  UserExperienceEducation,
  UserExperienceWork,
} from '../../../../graphql/user/profile';
import { profileExperiencesLimit } from '../../../../graphql/user/profile';

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
  work: UserExperienceWork[],
  education: UserExperienceEducation[],
): CompletionItem[] => {
  const hasProfileImage = !!user.image && user.image !== '';
  const hasHeadline =
    !!user.bio && typeof user.bio === 'string' && user.bio.trim() !== '';
  const hasExperienceLevel = !!user.experienceLevel;
  const hasWorkExperience = work && work.length > 0;
  const hasEducation = education && education.length > 0;

  return [
    {
      label: 'Profile image',
      completed: hasProfileImage,
      redirectPath: `${webappUrl}settings/profile`,
    },
    {
      label: 'Headline',
      completed: hasHeadline,
      redirectPath: `${webappUrl}settings/profile?field=bio`,
    },
    {
      label: 'Experience level',
      completed: hasExperienceLevel,
      redirectPath: `${webappUrl}settings/profile?field=experienceLevel`,
    },
    {
      label: 'Work experience',
      completed: hasWorkExperience,
      redirectPath: `${webappUrl}settings/profile/experience/work`,
    },
    {
      label: 'Education',
      completed: hasEducation,
      redirectPath: `${webappUrl}settings/profile/experience/education`,
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
  const { work, education, isLoading } = useProfileExperiences(
    user as PublicProfile,
    profileExperiencesLimit,
  );

  const items = useMemo(
    () => getCompletionItems(user, work, education),
    [user, work, education],
  );

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

  if (isCompleted || isLoading) {
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
