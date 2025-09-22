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
import { clearResumeMutationOptions } from '../mutations';
import { useActions, useToastNotification } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

export const ClearResumeButton = (): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { completeAction } = useActions();
  const opts = getCandidatePreferencesOptions(user?.id);
  const updateQuery = useUpdateQuery(opts);

  const { mutate: clearResume, isPending: isClearResumePending } = useMutation({
    ...clearResumeMutationOptions(updateQuery, () => {
      completeAction(ActionType.UserCandidatePreferencesSaved);
      logEvent({
        event_name: LogEvent.ClearCv,
      });
    }),
    onError: () => {
      displayToast('Failed to remove uploaded CV. Please try again.');
    },
  });
  return (
    <Tooltip content="Remove uploaded CV">
      <Button
        icon={<MiniCloseIcon />}
        className="ml-1"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        loading={isClearResumePending}
        onClick={() => clearResume()}
      />
    </Tooltip>
  );
};
