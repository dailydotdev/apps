import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { LoggedUser } from '../lib/user';
import { generateQueryKey, RequestKey } from '../lib/query';

export const SQUAD_WALLET_QUERY = gql`
  query SquadWallet($sourceId: ID!) {
    source(id: $sourceId) {
      id
      name
      currentMember {
        seat
      }
    }
    squadSubscription(sourceId: $sourceId) {
      plan
      coresBalance
    }
  }
`;

interface SquadWalletData {
  source: {
    id: string;
    name: string;
    currentMember?: { seat: boolean } | null;
  };
  squadSubscription: {
    plan: string | null;
    coresBalance: number;
  };
}

// A daily.dev for Startups squad's Cores wallet, filled by the plan's cashback
export interface SquadWallet {
  sourceId: string;
  name: string;
  balance: number;
}

export const squadWalletQueryOptions = ({
  user,
  sourceId,
}: {
  user?: Pick<LoggedUser, 'id'>;
  sourceId?: string;
}) => ({
  queryKey: generateQueryKey(RequestKey.SquadWallet, user, sourceId),
  queryFn: async (): Promise<SquadWallet | null> => {
    try {
      const { source, squadSubscription } =
        await gqlClient.request<SquadWalletData>(SQUAD_WALLET_QUERY, {
          sourceId,
        });

      // only the paid seats of an active plan can spend it
      if (!squadSubscription.plan || !source.currentMember?.seat) {
        return null;
      }

      return {
        sourceId: source.id,
        name: source.name,
        balance: squadSubscription.coresBalance,
      };
    } catch {
      // the subscription is only visible to squad admins and moderators
      return null;
    }
  },
  enabled: !!user?.id && !!sourceId,
});
