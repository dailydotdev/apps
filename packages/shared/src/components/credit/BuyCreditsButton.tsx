import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { CoreIcon, PlusIcon } from '../icons';

import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import Link from '../utilities/Link';
import { anchorDefaultRel } from '../../lib/strings';
import { useAuthContext } from '../../contexts/AuthContext';
import { largeNumberFormat } from '../../lib';
import type { Origin } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { useModalContext } from '../modals/common/types';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
import type { SquadWallet } from '../../graphql/squadWallet';
import { getWalletUrl } from '../../features/boost/BoostWalletBalance';

type BuyCreditsButtonProps = {
  className?: string;
  onPlusClick?: () => void;
  hideBuyButton?: boolean;
  origin?: Origin;
  /** Shows this squad wallet instead of the user's own Cores */
  squadWallet?: SquadWallet;
};
export const BuyCreditsButton = ({
  className,
  onPlusClick,
  hideBuyButton,
  origin,
  squadWallet,
}: BuyCreditsButtonProps): ReactElement | null => {
  const hasCoresAccess = useHasAccessToCores();
  const isInsideModal = useModalContext().onRequestClose !== null;
  const { user } = useAuthContext();

  const renderBuyButton = !hideBuyButton;
  const { logEvent } = useLogContext();
  const trackBuyCredits = () => {
    logEvent({
      event_name: LogEvent.StartBuyingCredits,
      extra: JSON.stringify({ origin }),
    });
    onPlusClick?.();
  };

  if (!hasCoresAccess) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex items-center rounded-10 bg-surface-float',
        className,
      )}
    >
      <Link href={getWalletUrl(squadWallet ?? null)} passHref>
        <Button
          tag="a"
          target={isInsideModal ? '_blank' : undefined}
          rel={anchorDefaultRel}
          variant={ButtonVariant.Tertiary}
          icon={<CoreIcon />}
          size={ButtonSize.Small}
        >
          {largeNumberFormat(
            squadWallet ? squadWallet.balance : user?.balance?.amount || 0,
          )}
        </Button>
      </Link>
      {renderBuyButton ? (
        <>
          <div className="h-[1.375rem] w-px bg-border-subtlest-tertiary" />
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<PlusIcon />}
            size={ButtonSize.Small}
            onClick={trackBuyCredits}
          />
        </>
      ) : null}
    </div>
  );
};
