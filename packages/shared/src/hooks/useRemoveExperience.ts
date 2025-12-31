import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import type { UserExperienceType } from '../graphql/user/profile';
import { removeUserExperience } from '../graphql/user/profile';
import { useToastNotification } from './useToastNotification';
import { labels } from '../lib/labels';
import { webappUrl } from '../lib/constants';
import { useUserExperiencesByType } from '../features/profile/hooks/useUserExperiencesByType';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent } from '../lib/log';

const useRemoveExperience = ({ type }: { type: UserExperienceType }) => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { queryKey: experienceQueryKey } = useUserExperiencesByType(
    type,
    user?.id,
  );
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => removeUserExperience(id),
    onSuccess: (_, id) => {
      logEvent({
        event_name: LogEvent.RemoveExperience,
        target_type: type,
        target_id: id,
      });
      router.push(`${webappUrl}settings/profile/experience/${type}`);
      qc.invalidateQueries({ queryKey: experienceQueryKey });
    },
    onError: () => {
      displayToast(labels.error.generic || 'Failed to delete experience');
    },
  });

  return { removeExperience: mutate, isPending };
};

export default useRemoveExperience;
