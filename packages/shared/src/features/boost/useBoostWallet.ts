import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { CampaignWallet } from '../../graphql/campaigns';
import type { SquadWallet } from '../../graphql/squadWallet';
import { squadWalletQueryOptions } from '../../graphql/squadWallet';
import { isIOSNative } from '../../lib/func';

interface UseBoostWallet {
  squadWallet: SquadWallet | null;
  wallet: CampaignWallet;
  setWallet: (wallet: CampaignWallet) => void;
  /** Balance of the selected wallet */
  balance: number;
  /** The squad wallet when it is the selected one, Cores bought go there */
  selectedSquadWallet: SquadWallet | null;
  /** Cores can't be bought into a squad wallet through the App Store */
  canBuyCores: boolean;
}

// Paid seats of a daily.dev for Startups squad can pay with the squad's
// wallet, which is then the default
export const useBoostWallet = (sourceId?: string): UseBoostWallet => {
  const { user } = useAuthContext();
  const { data: squadWallet = null } = useQuery(
    squadWalletQueryOptions({ user, sourceId }),
  );
  const [selected, setWallet] = useState<CampaignWallet>();
  const wallet =
    selected ?? (squadWallet ? CampaignWallet.Squad : CampaignWallet.User);
  const selectedSquadWallet =
    wallet === CampaignWallet.Squad ? squadWallet : null;
  const balance = selectedSquadWallet
    ? selectedSquadWallet.balance
    : (user?.balance.amount ?? 0);

  return {
    squadWallet,
    wallet,
    setWallet,
    balance,
    selectedSquadWallet,
    canBuyCores: !selectedSquadWallet || !isIOSNative(),
  };
};
