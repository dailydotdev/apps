import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useViewSize, ViewSize } from '../../hooks';
import { useBuyCoresContext } from '../../contexts/BuyCoresContext/types';
import { Loader } from '../Loader';
import { ElementPlaceholder } from '../ElementPlaceholder';
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
  const isSelected = selectedProduct?.id === id;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      disabled={isDisabled || (isIOSNative() ? false : !paddle)}
      className={classNames(
        'relative flex min-w-0 flex-col gap-1 rounded-14 border p-3 text-left transition-colors disabled:cursor-not-allowed',
        isSelected
          ? 'border-action-cores-default bg-action-cores-float'
          : 'border-border-subtlest-tertiary bg-surface-float hover:border-border-subtlest-secondary',
        isNotEnough && !isSelected && 'opacity-64',
      )}
    >
      <span className="flex items-center gap-2">
        <Image
          className="size-6 shrink-0"
          src={getCoreCurrencyImage(cores)}
          fallbackSrc={coreImage}
        />
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          className="truncate tabular-nums"
          bold
        >
          {label}
        </Typography>
      </span>
      <span className="flex items-center justify-between gap-2">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {priceFormatted}
        </Typography>
        {isRecommended && (
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption2}
            className="rounded-6 bg-action-cores-float px-1.5 py-0.5 text-action-cores-default"
            bold
          >
            Recommended
          </Typography>
        )}
      </span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center rounded-14 bg-background-default/[0.8]">
          <Loader />
        </span>
      )}
    </button>
  );
};

export const CoreOptionButtonPlaceholder = (): ReactElement => (
  <ElementPlaceholder className="h-[4.25rem] rounded-14" />
);
