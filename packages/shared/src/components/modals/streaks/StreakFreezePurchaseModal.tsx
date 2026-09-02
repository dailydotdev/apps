import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { ModalSize } from '../common/types';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { CoreIcon, ReadingStreakIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { formatCoresCurrency } from '../../../lib/utils';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useStreakFreeze } from '../../../hooks/streaks/useStreakFreeze';
import { STREAK_FREEZE_CAP } from '../../../graphql/streakFreeze';
import type { StreakFreezeProduct } from '../../../graphql/streakFreeze';

export interface StreakFreezePurchaseModalProps
  extends Pick<ModalProps, 'isOpen' | 'onAfterClose'> {
  onRequestClose: () => void;
}

const StreakFreezePack = ({
  product,
  isSelected,
  isDisabled,
  onSelect,
}: {
  product: StreakFreezeProduct;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}): ReactElement => {
  const { quantity } = product.flags;

  return (
    <Button
      type="button"
      className={classNames(
        'w-full',
        isSelected && 'border-action-cores-default bg-action-cores-float',
      )}
      variant={ButtonVariant.Float}
      size={ButtonSize.Large}
      role="radio"
      aria-checked={isSelected}
      disabled={isDisabled}
      onClick={onSelect}
      data-testid={`streak-freeze-pack-${product.id}`}
    >
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        bold
      >
        {quantity} freeze{quantity === 1 ? '' : 's'}
      </Typography>
      <div className="flex-1" />
      {isDisabled ? (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Max {STREAK_FREEZE_CAP} freezes
        </Typography>
      ) : (
        <span className="flex items-center gap-1">
          <CoreIcon size={IconSize.Size16} />
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {formatCoresCurrency(product.value)}
          </Typography>
        </span>
      )}
    </Button>
  );
};

export const StreakFreezePurchaseModal = (
  props: StreakFreezePurchaseModalProps,
): ReactElement | null => {
  const { isOpen, onRequestClose, onAfterClose } = props;
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const {
    freezesAvailable,
    products,
    isLoadingProducts,
    isPurchasing,
    canBuyProduct,
    onPurchase,
  } = useStreakFreeze();
  const [selectedProductId, setSelectedProductId] = useState<string>();

  const selectedProduct = products.find(
    (product) => product.id === selectedProductId,
  );

  useEffect(() => {
    if (selectedProductId || !products.length) {
      return;
    }

    const defaultProduct = products.find((product) => canBuyProduct(product));

    if (defaultProduct) {
      setSelectedProductId(defaultProduct.id);
    }
    // Only run once the products list resolves, to pick an initial pack.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  useEffect(() => {
    if (isLoadingProducts) {
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.StreakFreezePurchase,
      target_id: 'streak freeze purchase',
    });
    // Log once the modal's data has resolved, mirroring StreakRecoverModal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingProducts]);

  const onClose = () => {
    logEvent({ event_name: LogEvent.DismissStreakFreezePurchase });
    onRequestClose();
  };

  if (!user) {
    return null;
  }

  const canAffordSelected =
    !!selectedProduct && user.balance.amount >= selectedProduct.value;

  return (
    <Modal
      isOpen={isOpen}
      onAfterClose={onAfterClose}
      onRequestClose={onClose}
      size={ModalSize.Small}
    >
      <Modal.Header title="Streak freezes" showCloseButton />
      <Modal.Body className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <ReadingStreakIcon secondary size={IconSize.XLarge} />
          <Typography
            tag={TypographyTag.H3}
            type={TypographyType.Title3}
            bold
            data-testid="streak-freeze-purchase-heading"
          >
            Never lose your streak again
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Freezes auto-apply on days you miss reading, one per missed day. You
            can hold up to {STREAK_FREEZE_CAP} at a time.
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
          >
            You currently have{' '}
            <strong>
              {freezesAvailable} freeze{freezesAvailable === 1 ? '' : 's'}
            </strong>
          </Typography>
        </div>
        <div className="flex flex-col gap-2" role="radiogroup">
          {products.map((product) => (
            <StreakFreezePack
              key={product.id}
              product={product}
              isSelected={selectedProductId === product.id}
              isDisabled={!canBuyProduct(product)}
              onSelect={() => setSelectedProductId(product.id)}
            />
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer className="!h-auto flex-col">
        <Button
          className="w-full"
          variant={ButtonVariant.Primary}
          disabled={!selectedProduct}
          loading={isPurchasing}
          data-testid="streak-freeze-purchase-button"
          onClick={async () => {
            if (!selectedProduct) {
              return;
            }

            await onPurchase(selectedProduct);
            onRequestClose();
          }}
        >
          {canAffordSelected ? (
            <>
              Get {selectedProduct?.flags.quantity} freeze
              {selectedProduct?.flags.quantity === 1 ? '' : 's'} for{' '}
              <CoreIcon />
              {formatCoresCurrency(selectedProduct?.value ?? 0)}
            </>
          ) : (
            <>
              Buy Cores
              {selectedProduct && (
                <>
                  <CoreIcon />
                  {formatCoresCurrency(selectedProduct.value)}
                </>
              )}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StreakFreezePurchaseModal;
