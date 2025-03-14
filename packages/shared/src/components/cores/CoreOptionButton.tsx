import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useViewSize, ViewSize } from '../../hooks';
import { useBuyCoresContext } from '../../contexts/BuyCoresContext';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { CoinIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { LogEvent } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';

type CoreOptionButtonProps = {
  id: string;
};
export const CoreOptionButton = ({
  id,
}: CoreOptionButtonProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { logEvent } = useLogContext();
  const { selectedProduct, setSelectedProduct, openCheckout, origin } =
    useBuyCoresContext();
  const onSelect = useCallback(() => {
    // TODO: Amount should be deducted from selected product entity
    logEvent({
      event_name: LogEvent.SelectCreditsQuantity,
      extra: JSON.stringify({ origin, amount: id }),
    });
    setSelectedProduct(id);
    if (!isMobile) {
      openCheckout({ priceId: id });
    }
  }, [id, isMobile, openCheckout, setSelectedProduct]);
  return (
    <Button
      className={classNames(
        'w-full',
        selectedProduct === id
          ? 'border-action-cores-default bg-action-cores-float'
          : undefined,
      )}
      variant={ButtonVariant.Float}
      icon={<CoinIcon />}
      size={ButtonSize.Large}
      aria-checked={selectedProduct === id}
      role="radio"
      onClick={onSelect}
    >
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        bold
      >
        100
      </Typography>
      <div className="flex-1" />
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="font-normal"
      >
        $0.99
      </Typography>
    </Button>
  );
};
