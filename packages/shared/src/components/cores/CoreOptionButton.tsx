import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useViewSize, ViewSize } from '../../hooks';
import { useBuyCoresContext } from '../../contexts/BuyCoresContext/types';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { LogEvent } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { Image } from '../image/Image';
import { coreImage, getCoreCurrencyImage } from '../../lib/image';
import { isIOSNative } from '../../lib/func';

type CoreOptionButtonProps = {
  id: string;
  priceFormatted: string;
  cores: number;
  label: string;
  isLoading?: boolean;
  isDisabled?: boolean;
};

export const CoreOptionButton = ({
  id,
  priceFormatted,
  cores,
  label,
  isLoading,
  isDisabled,
}: CoreOptionButtonProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { logEvent } = useLogContext();
  const { selectedProduct, setSelectedProduct, openCheckout, origin, paddle } =
    useBuyCoresContext();
  const onSelect = useCallback(() => {
    logEvent({
      event_name: LogEvent.SelectCreditsQuantity,
      extra: JSON.stringify({ origin, quantity: selectedProduct?.value }),
    });

    setSelectedProduct({
      id,
      value: cores,
    });

    if (!isMobile) {
      openCheckout({ priceId: id });
    }
  }, [
    logEvent,
    origin,
    id,
    setSelectedProduct,
    cores,
    isMobile,
    openCheckout,
    selectedProduct,
  ]);
  return (
    <Button
      className={classNames(
        'w-full',
        selectedProduct?.id === id
          ? 'border-action-cores-default bg-action-cores-float'
          : undefined,
      )}
      variant={ButtonVariant.Float}
      icon={
        <Image
          className="mr-2 size-8"
          src={getCoreCurrencyImage(cores)}
          fallbackSrc={coreImage}
        />
      }
      size={ButtonSize.Large}
      aria-checked={selectedProduct?.id === id}
      role="radio"
      onClick={onSelect}
      disabled={isDisabled || (isIOSNative() ? false : !paddle)}
      loading={isLoading}
    >
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        bold
      >
        {label}
      </Typography>
      <div className="flex-1" />
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="font-normal"
      >
        {priceFormatted}
      </Typography>
    </Button>
  );
};

export const CoreOptionButtonPlaceholder = (): ReactElement => {
  return (
    <Button
      className="w-full"
      variant={ButtonVariant.Float}
      size={ButtonSize.Large}
      disabled
    >
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        bold
      />
    </Button>
  );
};
