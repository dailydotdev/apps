import type { ProfileCompletion } from './user';
import { webappUrl } from './constants';

export type CompletionItem = {
  label: string;
  completed: boolean;
  redirectPath: string;
};

export const getCompletionItems = (
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

export const formatCompletionDescription = (
  incompleteItems: CompletionItem[],
): string => {
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
