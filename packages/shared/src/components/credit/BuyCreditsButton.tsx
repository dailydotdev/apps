import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { CoreIcon, PlusIcon } from '../icons';

import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import Link from '../utilities/Link';
import { webappUrl } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import { isIOSNative } from '../../lib/func';
import { useAuthContext } from '../../contexts/AuthContext';
import { largeNumberFormat } from '../../lib';
import { LogEvent, Origin } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { useModalContext } from '../modals/common/types';

type BuyCreditsButtonProps = {
  className?: string;
  onPlusClick?: () => void;
  hideBuyButton?: boolean;
};
export const BuyCreditsButton = ({
  className,
  onPlusClick,
  hideBuyButton,
}: BuyCreditsButtonProps): ReactElement => {
  const isInsideModal = useModalContext().onRequestClose !== null;
  const { user } = useAuthContext();

  const renderBuyButton = !isIOSNative() && !hideBuyButton;
  const { logEvent } = useLogContext();
  const trackBuyCredits = () => {
    logEvent({
      event_name: LogEvent.StartBuyingCredits,
      extra: JSON.stringify({ origin: Origin.Award }),
    });
    onPlusClick?.();
  };

  return (
    <div
      className={classNames(
        'flex items-center rounded-10 bg-surface-float',
        className,
      )}
    >
      <Link href={`${webappUrl}earnings`} passHref>
        <Button
          tag="a"
          target={isInsideModal ? '_blank' : undefined}
          rel={anchorDefaultRel}
          variant={ButtonVariant.Tertiary}
          icon={<CoreIcon />}
          size={ButtonSize.Small}
        >
          {largeNumberFormat(user?.balance?.amount || 0)}
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
