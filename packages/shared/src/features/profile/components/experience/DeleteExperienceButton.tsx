import React from 'react';
import { UserExperienceType } from '../../../../hooks/useUserExperienceForm';
import useRemoveExperience from '../../../../hooks/useRemoveExperience';
import { Button } from '../../../../components/buttons/Button';
import {
  ButtonVariant,
  ButtonSize,
} from '../../../../components/buttons/common';

type DeleteExperienceButtonProps = {
  experienceId: string;
  experienceType?: UserExperienceType;
};

const getButtonCopy = (type?: UserExperienceType): string => {
  switch (type) {
    case UserExperienceType.Work:
      return 'Delete work experience';
    case UserExperienceType.Project:
      return 'Delete project';
    case UserExperienceType.Certification:
      return 'Delete certification';
    case UserExperienceType.Education:
      return 'Delete education';
    default:
      return 'Delete work experience';
  }
};

const DeleteExperienceButton = ({
  experienceId,
  experienceType,
}: DeleteExperienceButtonProps): React.ReactElement => {
  const { removeExperience, isPending } = useRemoveExperience();

  return (
    <div className="mt-6">
      <Button
        type="button"
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Small}
        disabled={isPending}
        loading={isPending}
        onClick={() => removeExperience(experienceId)}
      >
        {getButtonCopy(experienceType)}
      </Button>
    </div>
  );
};

export default DeleteExperienceButton;
