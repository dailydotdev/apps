import React from 'react';
import type { ReactElement } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import {
  ButtonV2,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/ButtonV2';
import { MiniCloseIcon } from '../../../components/icons';
import { getCandidatePreferencesOptions } from '../queries';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { clearEmploymentAgreementMutationOptions } from '../mutations';
import { useActions, useToastNotification } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

export const ClearEmploymentAgreementButton = (): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { completeAction } = useActions();

  const opts = getCandidatePreferencesOptions(user?.id ?? '');
  const updateQuery = useUpdateQuery(opts);

  const { mutate: clearFile, isPending: isClearFilePending } = useMutation({
    ...clearEmploymentAgreementMutationOptions(updateQuery, () => {
      completeAction(ActionType.UserCandidatePreferencesSaved);
      logEvent({
        event_name: LogEvent.ClearEmploymentAgreement,
      });
    }),
    onError: () => {
      displayToast(
        'Failed to remove uploaded employment agreement. Please try again.',
      );
    },
  });

  if (!user) {
    return <></>;
  }

  return (
    <Tooltip content="Remove uploaded employment agreement">
      <ButtonV2
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
