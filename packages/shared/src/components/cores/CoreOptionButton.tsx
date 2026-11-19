import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useViewSize, ViewSize } from '../../hooks';
import { useBuyCoresContext } from '../../contexts/BuyCoresContext/types';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
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
  /** The smallest pack that covers what the user is buying for */
  isRecommended?: boolean;
  /** The pack is too small for what the user is buying for */
  isNotEnough?: boolean;
};

export const CoreOptionButton = ({
  id,
  priceFormatted,
  cores,
  label,
  isLoading,
  isDisabled,
  isRecommended,
  isNotEnough,
}: CoreOptionButtonProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { logEvent } = useLogContext();
  const { selectedProduct, setSelectedProduct, openCheckout, origin, paddle } =
    useBuyCoresContext();
  const onSelect = useCallback(() => {
    logEvent({
      event_name: LogEvent.SelectCreditsQuantity,
      extra: JSON.stringify({ origin, quantity: cores }),
    });

    setSelectedProduct({
      id,
      value: cores,
    });

    if (!isMobile) {
      openCheckout?.({ priceId: id });
    }
  }, [logEvent, origin, id, setSelectedProduct, cores, isMobile, openCheckout]);
  return (
    <Button
      className={classNames(
        'w-full',
        selectedProduct?.id === id
          ? 'border-action-cores-default bg-action-cores-float'
          : undefined,
        isNotEnough && selectedProduct?.id !== id && 'opacity-64',
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
      {isRecommended && (
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption2}
          className="ml-2 rounded-6 bg-action-cores-float px-1.5 py-0.5 text-action-cores-default"
          bold
        >
          Recommended
        </Typography>
      )}
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
