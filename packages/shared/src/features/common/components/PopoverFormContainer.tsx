import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Popover,
  PopoverAnchor,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import classNames from 'classnames';
import { PopoverContent } from '../../../components/popover/Popover';
import type { ButtonProps } from '../../../components/buttons/Button';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { useToggle } from '../../../hooks/useToggle';
import { ArrowIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

interface OptionsPopoverProps extends PropsWithChildren {
  className?: string;
  onReset?: () => void;
  onSubmit?: () => void;
  resetProps?: ButtonProps<'button'>;
  submitProps?: ButtonProps<'button'>;
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
          <Button
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
          </Button>
        </PopoverTrigger>
      </PopoverAnchor>
      <PopoverContent
        sameWidthAsAnchor
        side="bottom"
        align="start"
        className="mt-1 rounded-16 border border-border-subtlest-tertiary bg-background-popover shadow-3"
      >
        <div className="max-h-80 flex-1 overflow-y-auto px-4 py-3">
          {children}
        </div>
        <div className="flex items-center justify-between border-t border-border-subtlest-tertiary px-4 py-2">
          <Button
            {...resetProps}
            onClick={() => onReset?.()}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          >
            Reset
          </Button>
          <Button
            {...submitProps}
            onClick={() => {
              onSubmit?.();
              togglePopover();
            }}
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
