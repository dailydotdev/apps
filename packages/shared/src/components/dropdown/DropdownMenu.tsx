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
import { useEventListener } from '../../hooks/useEventListener';
import ConditionalWrapper from '../ConditionalWrapper';
import type { TooltipProps } from '../tooltip/Tooltip';
import { Tooltip } from '../tooltip/Tooltip';
import Link from '../utilities/Link';
import type { MenuItemProps } from './common';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { getCompanionWrapper } from '../../lib/extension';
import { useScrollFade } from '../../hooks/useScrollFade';

export const DropdownMenuItem = classed(
  DropdownMenuItemRoot,
  'DropdownMenuItem',
);

interface DropdownMenuContentProps
  extends Omit<RadixDropdownMenuContentProps, 'className'> {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  variant?: 'action' | 'field';
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
  ({ children, ...props }, _forwardedRef) => {
    if (_forwardedRef) {
      // DropdownMenu is kept as forwardRef-compatible even though Radix root has no ref target here.
    }
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
>(
  (
    {
      children,
      className,
      align = 'end',
      collisionPadding,
      sideOffset,
      variant = 'action',
      ...props
    },
    forwardedRef,
  ) => {
    const { isCompanion } = useRequestProtocol();
    const container = isCompanion ? getCompanionWrapper() : undefined;
    const scrollFadeRef = useScrollFade<HTMLDivElement>();
    return (
      <DropdownMenuPortal container={container}>
        <DropdownMenuContentRoot
          {...props}
          ref={forwardedRef}
          className={classNames(
            'DropdownMenuContent overflow-hidden',
            variant === 'field'
              ? 'DropdownMenuContentField'
              : 'DropdownMenuContentAction',
            className,
          )}
          align={align}
          sideOffset={sideOffset ?? (variant === 'action' ? 6 : undefined)}
          collisionPadding={collisionPadding ?? 24}
        >
          <div
            ref={scrollFadeRef}
            className="DropdownMenuScrollable max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto bg-inherit"
          >
            {children}
          </div>
        </DropdownMenuContentRoot>
      </DropdownMenuPortal>
    );
  },
);

DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuOptions = ({
  options,
}: {
  options: MenuItemProps[];
}) => {
  return (
    <>
      {options.map(
        ({
          label,
          icon,
          action,
          anchorProps,
          disabled,
          Wrapper,
          ariaLabel,
        }: MenuItemProps) => {
          const className = 'inline-flex flex-1 items-center gap-2';
          return (
            <ConditionalWrapper
              key={label}
              condition={!!Wrapper}
              wrapper={(children) => <Wrapper>{children}</Wrapper>}
            >
              <DropdownMenuItem
                onClick={action}
                key={label}
                disabled={disabled}
                aria-label={ariaLabel}
              >
                {anchorProps ? (
                  <Link
                    href={anchorProps.href}
                    passHref
                    className={className}
                    role="menuitem"
                    {...anchorProps}
                  >
                    <a className={className} target={anchorProps?.target}>
                      {icon} {label}
                    </a>
                  </Link>
                ) : (
                  <button type="button" className={className} role="menuitem">
                    {icon} {label}
                  </button>
                )}
              </DropdownMenuItem>
            </ConditionalWrapper>
          );
        },
      )}
    </>
  );
};
