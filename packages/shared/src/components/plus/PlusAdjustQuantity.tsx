import React from 'react';
import type { Dispatch, ReactElement, SetStateAction } from 'react';
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

type Props = {
  itemQuantity: number;
  selectedOption: string;
  checkoutItemsLoading: boolean;
  setItemQuantity: Dispatch<SetStateAction<number>>;
  onChange?: (data: { priceId: string; quantity: number }) => void;
} & WithClassNameProps;

export const PlusAdjustQuantity = ({
  className,
  itemQuantity,
  selectedOption,
  checkoutItemsLoading,
  setItemQuantity,
  onChange,
}: Props): ReactElement => {
  return (
    <div className={classNames('flex flex-col gap-4', className)}>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        bold
      >
        Team size
      </Typography>

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
          onChange={({ target }) => {
            const newValue = Math.max(Number(target.value), 1);
            if (newValue === itemQuantity) {
              return;
            }
            setItemQuantity(newValue);
            onChange?.({ priceId: selectedOption, quantity: newValue });
          }}
        />
        <Button
          size={ButtonSize.Large}
          variant={ButtonVariant.Secondary}
          icon={<MinusIcon />}
          disabled={itemQuantity <= 1}
          loading={checkoutItemsLoading}
          onClick={() => {
            setItemQuantity((prev: number) => {
              const newValue = Math.max(prev - 1, 1);
              onChange?.({ priceId: selectedOption, quantity: newValue });
              return newValue;
            });
          }}
        />
        <Button
          size={ButtonSize.Large}
          variant={ButtonVariant.Secondary}
          icon={<PlusIcon />}
          loading={checkoutItemsLoading}
          onClick={() => {
            setItemQuantity((prev: number) => {
              const newValue = prev + 1;
              onChange?.({ priceId: selectedOption, quantity: newValue });
              return newValue;
            });
          }}
        />
      </div>
    </div>
  );
};
