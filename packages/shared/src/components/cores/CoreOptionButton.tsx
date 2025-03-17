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

type CoreOptionButtonProps = {
  id: string;
  priceFormatted: string;
  cores: number;
  label: string;
};

export const CoreOptionButton = ({
  id,
  priceFormatted,
  cores,
  label,
}: CoreOptionButtonProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { selectedProduct, setSelectedProduct, openCheckout } =
    useBuyCoresContext();
  const onSelect = useCallback(() => {
    setSelectedProduct({
      id,
      value: cores,
    });

    if (!isMobile) {
      openCheckout({ priceId: id });
    }
  }, [id, isMobile, openCheckout, setSelectedProduct, cores]);
  return (
    <Button
      className={classNames(
        'w-full',
        selectedProduct?.id === id
          ? 'border-action-cores-default bg-action-cores-float'
          : undefined,
      )}
      variant={ButtonVariant.Float}
      icon={<CoinIcon secondary />}
      size={ButtonSize.Large}
      aria-checked={selectedProduct?.id === id}
      role="radio"
      onClick={onSelect}
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
