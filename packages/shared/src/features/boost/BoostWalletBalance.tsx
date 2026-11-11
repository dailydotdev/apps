import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { CoreIcon, PlusIcon } from '../../components/icons';
import { largeNumberFormat } from '../../lib';
import { walletUrl } from '../../lib/constants';
import type { SquadWallet } from '../../graphql/squadWallet';
import { getSquadManageUrl, SquadManageSection } from '../squads/lib/routes';

interface BoostWalletBalanceProps {
  /** The wallet paying for the boost, the user's own when null */
  squadWallet: SquadWallet | null;
  balance: number;
  onBuyCores?: () => void;
}

export const getWalletUrl = (squadWallet: SquadWallet | null): string =>
  squadWallet
    ? getSquadManageUrl(squadWallet.handle, SquadManageSection.Plan)
    : walletUrl;

// The balance of the wallet paying for the boost, "+" tops up that wallet
export function BoostWalletBalance({
  squadWallet,
  balance,
  onBuyCores,
}: BoostWalletBalanceProps): ReactElement {
  return (
    <div className="ml-4 flex flex-row rounded-10 bg-surface-float">
      <Button
        icon={<CoreIcon />}
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        target="_blank"
        href={getWalletUrl(squadWallet)}
        tag="a"
        title={squadWallet ? `${squadWallet.name} wallet` : 'My Cores'}
      >
        {largeNumberFormat(balance)}
      </Button>
      {onBuyCores && (
        <>
          <div className="my-1 border-l border-border-subtlest-tertiary" />
          <Button
            icon={<PlusIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            onClick={onBuyCores}
            aria-label={
              squadWallet ? `Buy Cores for ${squadWallet.name}` : 'Buy Cores'
            }
          />
        </>
      )}
    </div>
  );
}
