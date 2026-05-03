import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Popover,
  PopoverAnchor,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import classNames from 'classnames';
import { PopoverContent } from '../../../components/popover/Popover';
import type { ButtonV2Props } from '../../../components/buttons/ButtonV2';
import {
  ButtonV2,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/ButtonV2';
import { useToggle } from '../../../hooks/useToggle';
import { ArrowIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

interface OptionsPopoverProps extends PropsWithChildren {
  className?: string;
  onReset?: () => void;
  onSubmit?: () => void;
  resetProps?: ButtonV2Props<'button'>;
  submitProps?: ButtonV2Props<'button'>;
  triggerChildren: ReactNode;
}

export const PopoverFormContainer = ({
  children,
  className,
  onReset,
  onSubmit,
  triggerChildren,
  submitProps,
  resetProps,
  ...attrs
}: OptionsPopoverProps): ReactElement => {
  const [isOpen, togglePopover] = useToggle(false);
  return (
    <Popover open={isOpen} onOpenChange={togglePopover}>
      <PopoverAnchor asChild>
        <PopoverTrigger asChild>
          <ButtonV2
            {...attrs}
            className={classNames('w-full justify-between', className)}
            iconPosition={ButtonIconPosition.Right}
            icon={
              <ArrowIcon
                aria-hidden
                className={classNames(
                  'text-text-secondary',
                  !isOpen && 'rotate-180',
                )}
                size={IconSize.XSmall}
              />
            }
            size={ButtonSize.Large}
            variant={ButtonVariant.Float}
          >
            {triggerChildren}
          </ButtonV2>
        </PopoverTrigger>
      </PopoverAnchor>
      <PopoverContent
        sameWidthAsAnchor
        side="bottom"
        align="start"
        className="mt-1 rounded-16 border border-border-subtlest-tertiary bg-background-popover shadow-3"
      >
        <div className="max-h-80 flex-1 overflow-x-hidden px-4 py-3">
          {children}
        </div>
        <div className="flex items-center justify-between border-t border-border-subtlest-tertiary px-4 py-2">
          <ButtonV2
            {...resetProps}
            onClick={() => onReset?.()}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          >
            Reset
          </ButtonV2>
          <ButtonV2
            {...submitProps}
            onClick={() => {
              onSubmit?.();
              togglePopover();
            }}
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
          >
            Done
          </ButtonV2>
        </div>
      </PopoverContent>
    </Popover>
  );
};
