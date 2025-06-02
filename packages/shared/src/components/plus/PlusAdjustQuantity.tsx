import React, { useCallback } from 'react'; // Import useCallback
import type { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { TextField } from '../fields/TextField';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { MinusIcon, PlusIcon } from '../icons';
import type { WithClassNameProps } from '../utilities';
import { usePlusSubscription } from '../../hooks';
import { LogEvent } from '../../lib/log';

type Props = {
  itemQuantity: number;
  selectedOption: string;
  checkoutItemsLoading: boolean;
  setItemQuantity: Dispatch<SetStateAction<number>>;
  onChange?: (data: { priceId: string; quantity: number }) => void;
  label?: ReactNode;
  existingSubscription?: boolean;
} & WithClassNameProps;

const minQuantity = 1;

export const PlusAdjustQuantity = ({
  className,
  itemQuantity,
  selectedOption,
  checkoutItemsLoading,
  setItemQuantity,
  onChange,
  label,
  existingSubscription = false,
}: Props): ReactElement => {
  const { logSubscriptionEvent } = usePlusSubscription();

  const onQuantityChange = useCallback(
    (value: number) => {
      const newQuantity = Math.max(value, minQuantity);

      // Only update state if the quantity has actually changed
      if (newQuantity !== itemQuantity) {
        setItemQuantity(newQuantity);
        onChange?.({ priceId: selectedOption, quantity: newQuantity });
        logSubscriptionEvent({
          event_name: LogEvent.SetOrgSize,
          target_id: newQuantity.toString(),
          extra: {
            existing: existingSubscription,
          },
        });
      }
    },
    [
      itemQuantity,
      setItemQuantity,
      onChange,
      selectedOption,
      logSubscriptionEvent,
      existingSubscription,
    ],
  );

  return (
    <div className={classNames('flex flex-col gap-4', className)}>
      {label && (
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          bold
        >
          {label}
        </Typography>
      )}

      <div className="flex gap-1">
        <TextField
          label={null}
          inputId="team-size"
          value={itemQuantity}
          type="number"
          className={{
            container: 'flex-1 tablet:max-w-60',
          }}
          focused
          onChange={({ target }) => onQuantityChange(Number(target.value))}
        />
        <Button
          size={ButtonSize.Large}
          variant={ButtonVariant.Secondary}
          icon={<MinusIcon />}
          disabled={itemQuantity <= minQuantity} // Use minQuantity here
          loading={checkoutItemsLoading}
          onClick={() => onQuantityChange(itemQuantity - 1)}
        />
        <Button
          size={ButtonSize.Large}
          variant={ButtonVariant.Secondary}
          icon={<PlusIcon />}
          loading={checkoutItemsLoading}
          onClick={() => onQuantityChange(itemQuantity + 1)}
        />
      </div>
    </div>
  );
};
