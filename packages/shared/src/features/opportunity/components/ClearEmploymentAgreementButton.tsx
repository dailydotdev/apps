import React from 'react';
import type { ReactElement } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon } from '../../../components/icons';
import { getCandidatePreferencesOptions } from '../queries';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { clearEmploymentAgreementMutationOptions } from '../mutations';
import { useActions, useToastNotification } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';

export const ClearEmploymentAgreementButton = (): ReactElement => {
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { completeAction } = useActions();
  const opts = getCandidatePreferencesOptions(user?.id);
  const updateQuery = useUpdateQuery(opts);

  const { mutate: clearFile, isPending: isClearFilePending } = useMutation({
    ...clearEmploymentAgreementMutationOptions(updateQuery, () => {
      completeAction(ActionType.UserCandidatePreferencesSaved);
    }),
    onError: () => {
      displayToast(
        'Failed to remove uploaded employment agreement. Please try again.',
      );
    },
  });
  return (
    <Tooltip content="Remove uploaded employment agreement">
      <Button
        icon={<MiniCloseIcon />}
        className="ml-1"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        loading={isClearFilePending}
        onClick={() => clearFile()}
      />
    </Tooltip>
  );
};
