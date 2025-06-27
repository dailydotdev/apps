import type { ReactNode } from 'react';
import React, { isValidElement, useState } from 'react';
import classNames from 'classnames';
import './style.css';
import type {
  DropdownMenuContentProps as RadixDropdownMenuContentProps,
  DropdownMenuProps,
  DropdownMenuTriggerProps,
} from '@radix-ui/react-dropdown-menu';
import {
  DropdownMenu as DropdownMenuRoot,
  DropdownMenuContent as DropdownMenuContentRoot,
  DropdownMenuPortal,
  DropdownMenuTrigger as DropdownMenuTriggerRoot,
  DropdownMenuItem as DropdownMenuItemRoot,
} from '@radix-ui/react-dropdown-menu';
import classed from '../../lib/classed';
import { useEventListener } from '../../hooks';
import ConditionalWrapper from '../ConditionalWrapper';
import type { TooltipProps } from '../tooltip/Tooltip';
import { Tooltip } from '../tooltip/Tooltip';

export const DropdownMenuItem = classed(
  DropdownMenuItemRoot,
  'DropdownMenuItem',
);

interface DropdownMenuContentProps
  extends Omit<RadixDropdownMenuContentProps, 'className'> {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps & { tooltip?: Omit<TooltipProps, 'children'> }
>(({ children, tooltip, ...props }, forwardedRef) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  if (!isValidElement(children)) {
    return undefined;
  }

  return (
    <ConditionalWrapper
      condition={!!tooltip}
      wrapper={(component) => {
        const { ...tooltipProps } = tooltip;
        return (
          <Tooltip {...tooltipProps} visible={tooltipVisible}>
            {component}
          </Tooltip>
        );
      }}
    >
      <DropdownMenuTriggerRoot ref={forwardedRef} {...props}>
        {React.cloneElement(children, {
          onMouseEnter: () => setTooltipVisible(true),
          onMouseLeave: () => setTooltipVisible(false),
          'aria-label': tooltip?.content,
          ...children?.props,
        })}
      </DropdownMenuTriggerRoot>
    </ConditionalWrapper>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ children, ...props }) => {
    const [open, setOpen] = useState(false);

    useEventListener(globalThis, 'scroll', () => {
      props.onOpenChange?.(false);
      setOpen(false);
    });

    return (
      <DropdownMenuRoot
        open={props.open || open}
        onOpenChange={(value) => {
          props.onOpenChange?.(value);
          setOpen(value);
        }}
        modal={false}
        {...props}
      >
        {children}
      </DropdownMenuRoot>
    );
  },
);
DropdownMenu.displayName = 'DropdownMenu';

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ children, className, align = 'end', ...props }, forwardedRef) => {
  return (
    <DropdownMenuPortal>
      <DropdownMenuContentRoot
        {...props}
        ref={forwardedRef}
        className={classNames('DropdownMenuContent', className)}
        align={align}
      >
        {children}
      </DropdownMenuContentRoot>
    </DropdownMenuPortal>
  );
});

DropdownMenuContent.displayName = 'DropdownMenuContent';
