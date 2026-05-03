import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { CoreIcon, PlusIcon } from '../icons';

import { ButtonV2, ButtonSize, ButtonVariant } from '../buttons/ButtonV2';
import Link from '../utilities/Link';
import { walletUrl } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import { useAuthContext } from '../../contexts/AuthContext';
import { largeNumberFormat } from '../../lib';
import { LogEvent, Origin } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { useModalContext } from '../modals/common/types';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';

type BuyCreditsButtonProps = {
  className?: string;
  onPlusClick?: () => void;
  hideBuyButton?: boolean;
};
export const BuyCreditsButton = ({
  className,
  onPlusClick,
  hideBuyButton,
}: BuyCreditsButtonProps): ReactElement | null => {
  const hasCoresAccess = useHasAccessToCores();
  const isInsideModal = useModalContext().onRequestClose !== null;
  const { user } = useAuthContext();

  const renderBuyButton = !hideBuyButton;
  const { logEvent } = useLogContext();
  const trackBuyCredits = () => {
    logEvent({
      event_name: LogEvent.StartBuyingCredits,
      extra: JSON.stringify({ origin: Origin.Award }),
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
      <Link href={walletUrl} passHref>
        <ButtonV2
          tag="a"
          target={isInsideModal ? '_blank' : undefined}
          rel={anchorDefaultRel}
          variant={ButtonVariant.Tertiary}
          icon={<CoreIcon />}
          size={ButtonSize.Small}
        >
          {largeNumberFormat(user?.balance?.amount || 0)}
        </ButtonV2>
      </Link>
      {renderBuyButton ? (
        <>
          <div className="h-[1.375rem] w-px bg-border-subtlest-tertiary" />
          <ButtonV2
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
