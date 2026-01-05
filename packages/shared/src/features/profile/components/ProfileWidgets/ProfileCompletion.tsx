import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import ProgressCircle from '../../../../components/ProgressCircle';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { InfoIcon, MoveToIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import type { ProfileCompletion as ProfileCompletionData } from '../../../../lib/user';
import Link from '../../../../components/utilities/Link';
import { anchorDefaultRel } from '../../../../lib/strings';
import { webappUrl } from '../../../../lib/constants';
import { useAuthContext } from '../../../../contexts/AuthContext';

type CompletionItem = {
  label: string;
  completed: boolean;
  redirectPath: string;
};

type ProfileCompletionProps = {
  className?: string;
};

const getCompletionItems = (
  completion: ProfileCompletionData,
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
}: ProfileCompletionProps): ReactElement | null => {
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

  const description = useMemo(
    () => formatDescription(incompleteItems),
    [incompleteItems],
  );

  const firstIncompleteItem = incompleteItems[0];
  const redirectPath = firstIncompleteItem?.redirectPath;

  const progress = profileCompletion?.percentage ?? 0;
  const isCompleted = progress === 100;

  if (!profileCompletion || isCompleted) {
    return null;
  }

  return (
    <Link href={redirectPath}>
      <a
        href={redirectPath}
        rel={anchorDefaultRel}
        className={classNames(
          'flex cursor-pointer flex-col gap-6 border border-action-help-active bg-action-help-float p-4 hover:bg-action-help-hover laptop:rounded-16',
          className,
        )}
      >
        <div className="flex w-full items-center gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-1">
              <InfoIcon
                size={IconSize.XSmall}
                className="text-text-secondary"
              />
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
                bold
              >
                Profile Completion
              </Typography>
            </div>
            <div className="flex min-w-0 items-center gap-1">
              <MoveToIcon
                size={IconSize.XSmall}
                className="shrink-0 text-text-secondary"
              />
              <div className="min-w-0 max-w-full flex-1">
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Secondary}
                  className="w-full break-words"
                >
                  {description}
                </Typography>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 leading-none">
            <ProgressCircle
              progress={progress}
              size={50}
              showPercentage
              color="help"
            />
          </div>
        </div>
      </a>
    </Link>
  );
};
