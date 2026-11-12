import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CopyNotifyFunction } from './useCopy';
import { useCopyLink } from './useCopy';
import { useLogContext } from '../contexts/LogContext';
import { useAuthContext } from '../contexts/AuthContext';
import { LogEvent } from '../lib/log';
import type { Squad } from '../graphql/sources';
import { squadReferralUrlQueryOptions } from '../graphql/squads';
import { useActions } from './useActions';
import { ActionType } from '../graphql/actions';

export interface UseSquadInvitationProps {
  squad: Squad;
  origin: string;
  /** Loads the link ahead of the click, while the invite action is in view. */
  enabled?: boolean;
}

export interface UseSquadInvitation {
  invitation: string;
  copying: boolean;
  logAndCopyLink: CopyNotifyFunction;
}

export const useSquadInvitation = ({
  squad,
  origin,
  enabled = true,
}: UseSquadInvitationProps): UseSquadInvitation => {
  const { logEvent } = useLogContext();
  const { completeAction } = useActions();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const queryOptions = squadReferralUrlQueryOptions({
    user,
    sourceId: squad.id,
  });
  const { data } = useQuery({
    ...queryOptions,
    enabled: enabled && queryOptions.enabled,
  });

  const invitation = data ?? '';
  const [copying, copyLink] = useCopyLink(() => invitation);

  const logAndCopyLink = async () => {
    logEvent({
      event_name: LogEvent.ShareSquadInvitation,
      extra: JSON.stringify({ origin, squad: squad.id }),
    });

    completeAction(ActionType.SquadInvite);

    if (invitation) {
      return copyLink();
    }

    // Safari may refuse a clipboard write that follows a request, which is
    // why callers load the link before the click.
    const link = await queryClient
      .fetchQuery(queryOptions)
      .catch((): null => null);

    return copyLink({ link: link ?? undefined });
  };

  return {
    invitation,
    copying,
    logAndCopyLink,
  };
};
