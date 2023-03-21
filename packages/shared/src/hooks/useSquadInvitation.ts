import { useMemo } from 'react';
import { Squad } from '../graphql/squads';

export type UseSquadInvitationProps = {
  squad: Squad;
};

export function useSquadInvitation({
  squad,
}: UseSquadInvitationProps): string | undefined {
  return useMemo(() => {
    const permalink = squad?.permalink;
    const token = squad?.currentMember?.referralToken;

    if (!permalink || !token) {
      return undefined;
    }

    const invitation = `${permalink}/${token}`;

    return invitation;
  }, [squad]);
}
