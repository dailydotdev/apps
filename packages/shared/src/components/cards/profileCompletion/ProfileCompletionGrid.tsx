import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import ProgressCircle from '../../ProgressCircle';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import type { ProfileCompletion as ProfileCompletionData } from '../../../lib/user';
import { webappUrl } from '../../../lib/constants';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';

type CompletionItem = {
  label: string;
  completed: boolean;
  redirectPath: string;
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

const formatNextStep = (incompleteItems: CompletionItem[]): string => {
  if (incompleteItems.length === 0) {
    return 'Your profile is complete!';
  }

  const labels = incompleteItems.map((item) => item.label.toLowerCase());
  const formattedList =
    labels.length === 1
      ? labels[0]
      : `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;

  return `Add ${formattedList}.`;
};

export const ProfileCompletionGrid = (): ReactElement | null => {
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

  const nextStep = useMemo(
    () => formatNextStep(incompleteItems),
    [incompleteItems],
  );

  const firstIncompleteItem = incompleteItems[0];
  const redirectPath = firstIncompleteItem?.redirectPath;

  const progress = profileCompletion?.percentage ?? 0;

  if (!profileCompletion || !redirectPath) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-16 border border-action-help-active bg-action-help-float px-6 py-4">
      <ProgressCircle
        progress={progress}
        size={48}
        showPercentage
        color="help"
      />
      <Typography
        type={TypographyType.Title2}
        color={TypographyColor.Primary}
        bold
      >
        Profile completion
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        {nextStep}
      </Typography>
      <Button
        className="mt-auto w-full"
        tag="a"
        href={redirectPath}
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
      >
        Update your profile
      </Button>
    </div>
  );
};
