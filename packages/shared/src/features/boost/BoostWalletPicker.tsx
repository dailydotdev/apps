import type { ReactElement } from 'react';
import React from 'react';
import { Radio } from '../../components/fields/Radio';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { CoreIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { largeNumberFormat } from '../../lib';
import { CampaignWallet } from '../../graphql/campaigns';
import type { SquadWallet } from '../../graphql/squadWallet';

interface BoostWalletPickerProps {
  squadWallet: SquadWallet;
  userBalance: number;
  wallet: CampaignWallet;
  onChange: (wallet: CampaignWallet) => void;
  totalSpend: number;
}

const WalletOption = ({
  name,
  amount,
}: {
  name: string;
  amount: number;
}): ReactElement => (
  <span className="flex w-full items-center gap-2">
    <span className="flex-1 truncate">{name}</span>
    <span className="flex items-center gap-1 text-text-tertiary">
      <CoreIcon size={IconSize.Size16} />
      {largeNumberFormat(amount)}
    </span>
  </span>
);

export function BoostWalletPicker({
  squadWallet,
  userBalance,
  wallet,
  onChange,
  totalSpend,
}: BoostWalletPickerProps): ReactElement {
  const isSquadShort =
    wallet === CampaignWallet.Squad && squadWallet.balance < totalSpend;

  return (
    <div className="flex flex-col">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Pay with
      </Typography>
      <Radio
        name="boost-wallet"
        value={wallet}
        onChange={onChange}
        className={{
          container: 'mt-1 w-full !gap-0',
          content: 'w-full',
          label: 'flex-1',
        }}
        options={[
          {
            value: CampaignWallet.Squad,
            label: (
              <WalletOption
                name={`${squadWallet.name} wallet`}
                amount={squadWallet.balance}
              />
            ),
            className: { wrapper: 'w-full' },
          },
          {
            value: CampaignWallet.User,
            label: <WalletOption name="My Cores" amount={userBalance} />,
            className: { wrapper: 'w-full' },
          },
        ]}
      />
      {isSquadShort && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          The squad wallet doesn&apos;t have enough Cores for this boost. Lower
          the budget or pay with your own Cores.
        </Typography>
      )}
    </div>
  );
}
