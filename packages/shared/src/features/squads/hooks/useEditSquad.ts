import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import type { SquadForm } from '../../../graphql/squads';
import { editSquad } from '../../../graphql/squads';
import type { ApiErrorResult } from '../../../graphql/common';
import { PrivacyOption } from '../../../components/squads/settings/SquadPrivacySection';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useBoot } from '../../../hooks/useBoot';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { parseOrDefault } from '../../../lib/func';
import { getSquadId } from '../lib/features';

const DEFAULT_ERROR = "Oops! That didn't seem to work. Let's try again!";

// editSquad replaces every setting, so each Manage section sends the squad's
// current values with its own changes on top.
export const getSquadForm = (squad: Squad): SquadForm => ({
  name: squad.name,
  handle: squad.handle,
  description: squad.description,
  memberPostingRole: squad.memberPostingRole,
  memberInviteRole: squad.memberInviteRole,
  moderationRequired: squad.moderationRequired,
  postingMinReputation: squad.postingMinReputation,
  categoryId: squad.category?.id,
  status: squad.public ? PrivacyOption.Public : PrivacyOption.Private,
});

interface UseEditSquad {
  onEdit: (form: Partial<SquadForm>) => Promise<Squad>;
  isPending: boolean;
}

export const useEditSquad = (squad: Squad): UseEditSquad => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { updateSquad } = useBoot();
  const { displayToast } = useToastNotification();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (form: Partial<SquadForm>) =>
      editSquad({
        id: getSquadId(squad),
        form: { ...getSquadForm(squad), ...form },
      }),
    onSuccess: async (data) => {
      await client.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Squad, user, squad.handle),
      });
      updateSquad(data);
      displayToast('The Squad has been updated');
    },
    onError: (error: ApiErrorResult) => {
      const result = parseOrDefault<Record<string, string>>(
        error?.response?.errors?.[0]?.message,
      );

      displayToast(
        typeof result === 'object' && result.handle
          ? result.handle
          : DEFAULT_ERROR,
      );
    },
  });

  return { onEdit: mutateAsync, isPending };
};
