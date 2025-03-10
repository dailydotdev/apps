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
};
export const CoreOptionButton = ({
  id,
}: CoreOptionButtonProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { selectedProduct, setSelectedProduct, openCheckout } =
    useBuyCoresContext();
  const onSelect = useCallback(() => {
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
