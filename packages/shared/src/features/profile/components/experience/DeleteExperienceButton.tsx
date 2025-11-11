import React from 'react';
import useRemoveExperience from '../../../../hooks/useRemoveExperience';
import { Button, ButtonColor } from '../../../../components/buttons/Button';
import {
  ButtonVariant,
  ButtonSize,
} from '../../../../components/buttons/common';
import { UserExperienceType } from '../../../../graphql/user/profile';
import { usePrompt } from '../../../../hooks/usePrompt';
import type { PromptOptions } from '../../../../hooks/usePrompt';

type DeleteExperienceButtonProps = {
  experienceId: string;
  experienceType?: UserExperienceType;
};

const copy: Record<UserExperienceType, string> = {
  [UserExperienceType.Work]: 'Delete work experience',
  [UserExperienceType.Project]: 'Delete project',
  [UserExperienceType.Certification]: 'Delete certification',
  [UserExperienceType.Education]: 'Delete education',
  [UserExperienceType.Volunteering]: 'Delete volunteering',
  [UserExperienceType.OpenSource]: 'Delete open source',
};

const getCopy = (type?: UserExperienceType): string => {
  if (type && copy[type]) {
    return copy[type];
  }
  return copy[UserExperienceType.Work];
};

const DeleteExperienceButton = ({
  experienceId,
  experienceType,
}: DeleteExperienceButtonProps): React.ReactElement => {
  const { removeExperience, isPending } = useRemoveExperience();
  const { showPrompt } = usePrompt();

  const buttonCopy = getCopy(experienceType);

  const handleDelete = async () => {
    const options: PromptOptions = {
      title: `${buttonCopy}?`,
      description: 'This action cannot be undone.',
      okButton: {
        title: 'Delete',
        variant: ButtonVariant.Primary,
        color: ButtonColor.Ketchup,
      },
    };

    if (await showPrompt(options)) {
      removeExperience(experienceId);
    }
  };

  return (
    <div className="mt-6">
      <Button
        type="button"
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Small}
        disabled={isPending}
        loading={isPending}
        onClick={handleDelete}
      >
        {buttonCopy}
      </Button>
    </div>
  );
};

export default DeleteExperienceButton;
