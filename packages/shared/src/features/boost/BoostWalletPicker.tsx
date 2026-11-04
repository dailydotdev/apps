import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { RadioItem } from '../../components/fields/RadioItem';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { CoreIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { largeNumberFormat } from '../../lib';
import { CampaignWallet } from '../../graphql/campaigns';
import type { SquadWallet } from '../../graphql/squadWallet';

interface BoostWalletPickerProps {
  squadWallet: SquadWallet | null;
  userBalance: number;
  wallet: CampaignWallet;
  onChange: (wallet: CampaignWallet) => void;
  totalSpend: number;
  /** Tops up the user's own Cores, hidden where Cores can't be bought. */
  onBuyCores?: () => void;
}

const Label = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography
    type={TypographyType.Footnote}
    color={TypographyColor.Tertiary}
    bold
  >
    {children}
  </Typography>
);

const Coverage = ({
  balance,
  totalSpend,
  isSelected,
}: {
  balance: number;
  totalSpend: number;
  isSelected: boolean;
}): ReactElement => {
  const missing = totalSpend - balance;

  return (
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Footnote}
      color={
        missing > 0 && isSelected
          ? TypographyColor.StatusError
          : TypographyColor.Tertiary
      }
    >
      {missing > 0
        ? `${largeNumberFormat(missing)} short for this boost`
        : 'Covers this boost'}
    </Typography>
  );
};

interface WalletCardProps {
  value: CampaignWallet;
  name: string;
  balance: number;
  totalSpend: number;
  isSelected: boolean;
  /** Only one wallet: no radio, it just shows the balance. */
  isOnlyWallet: boolean;
  onChange: (wallet: CampaignWallet) => void;
  action?: ReactNode;
}

const WalletCard = ({
  value,
  name,
  balance,
  totalSpend,
  isSelected,
  isOnlyWallet,
  onChange,
  action,
}: WalletCardProps): ReactElement => {
  const content = (
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="flex items-center gap-2">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          className="flex-1 truncate"
          bold
        >
          {name}
        </Typography>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          className="flex items-center gap-1 tabular-nums"
        >
          <CoreIcon size={IconSize.Size16} />
          {largeNumberFormat(balance)}
        </Typography>
      </span>
      <Coverage
        balance={balance}
        totalSpend={totalSpend}
        isSelected={isSelected}
      />
    </span>
  );

  return (
    <div
      className={classNames(
        'flex items-center gap-2 rounded-14 border transition-colors',
        isSelected && !isOnlyWallet
          ? 'border-border-subtlest-primary bg-surface-float'
          : 'border-border-subtlest-tertiary',
        isOnlyWallet ? 'px-4 py-3' : 'py-2 pl-1 pr-3',
      )}
    >
      {isOnlyWallet ? (
        content
      ) : (
        <RadioItem
          id={`boost-wallet-${value}`}
          name="boost-wallet"
          value={value}
          checked={isSelected}
          onChange={() => onChange(value)}
          aria-label={name}
          className={{ content: 'min-w-0 flex-1 !pr-0' }}
        >
          {content}
        </RadioItem>
      )}
      {action}
    </div>
  );
};

/**
 * Which Cores pay for the boost. Paid seats of a daily.dev for Startups squad
 * get the squad wallet next to their own; everyone else sees their balance.
 */
export function BoostWalletPicker({
  squadWallet,
  userBalance,
  wallet,
  onChange,
  totalSpend,
  onBuyCores,
}: BoostWalletPickerProps): ReactElement {
  const isOnlyWallet = !squadWallet;
  const isSquadShort =
    wallet === CampaignWallet.Squad &&
    !!squadWallet &&
    squadWallet.balance < totalSpend;

  return (
    <div className="flex flex-col gap-2">
      <Label>Pay with</Label>
      {squadWallet && (
        <WalletCard
          value={CampaignWallet.Squad}
          name={`${squadWallet.name} wallet`}
          balance={squadWallet.balance}
          totalSpend={totalSpend}
          isSelected={wallet === CampaignWallet.Squad}
          isOnlyWallet={false}
          onChange={onChange}
        />
      )}
      <WalletCard
        value={CampaignWallet.User}
        name="My Cores"
        balance={userBalance}
        totalSpend={totalSpend}
        isSelected={wallet === CampaignWallet.User}
        isOnlyWallet={isOnlyWallet}
        onChange={onChange}
        action={
          onBuyCores && (
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Float}
              onClick={onBuyCores}
            >
              Buy Cores
            </Button>
          )
        }
      />
      {isSquadShort && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Lower the budget or the duration, or pay with your own Cores. The
          squad wallet is topped up with every plan payment.
        </Typography>
      )}
    </div>
  );
}
