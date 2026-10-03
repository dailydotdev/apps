import type { ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  isValidElement,
  useContext,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
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
import styles from './style.module.css';
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
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { attachSheetDrag } from '../shell/sheetDrag';

export const DropdownMenuItem = classed(
  DropdownMenuItemRoot,
  styles.DropdownMenuItem,
);

interface DropdownMenuContentProps
  extends Omit<RadixDropdownMenuContentProps, 'className'> {
  children: ReactNode;
  className?: string;
  scrollableClassName?: string;
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

const assignRef = <T,>(ref: React.ForwardedRef<T>, node: T | null) => {
  if (typeof ref === 'function') {
    ref(node);
  } else if (ref) {
    Object.assign(ref, { current: node });
  }
};

// Lets the phone sheet close itself (a drag past a third) through the
// root's own open state.
const DropdownMenuCloseContext = createContext<() => void>(() => undefined);

export const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ children, ...props }, _forwardedRef) => {
    if (_forwardedRef) {
      // DropdownMenu is kept as forwardRef-compatible even though Radix root has no ref target here.
    }
    const [open, setOpen] = useState(false);
    const isPhone = useViewSize(ViewSize.MobileL);

    // On a phone the menu is a sheet: modal, so a tap on the scrim closes it
    // without reaching the page, and never closed by the scroll the
    // collapsing address bar fires.
    useEventListener(globalThis.window, 'scroll', () => {
      if (isPhone) {
        return;
      }
      props.onOpenChange?.(false);
      setOpen(false);
    });

    const close = () => {
      props.onOpenChange?.(false);
      setOpen(false);
    };

    return (
      <DropdownMenuCloseContext.Provider value={close}>
        <DropdownMenuRoot
          open={props.open || open}
          onOpenChange={(value) => {
            props.onOpenChange?.(value);
            setOpen(value);
          }}
          modal={isPhone}
          {...props}
        >
          {children}
        </DropdownMenuRoot>
      </DropdownMenuCloseContext.Provider>
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
      scrollableClassName,
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
    const isPhone = useViewSize(ViewSize.MobileL);
    const close = useContext(DropdownMenuCloseContext);
    const closeRef = useRef(close);
    closeRef.current = close;
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const detachDrag = useRef<() => void>();
    const setScrollRef = (node: HTMLDivElement | null) => {
      scrollRef.current = node;
      scrollFadeRef(node);
    };
    // Radix mounts the content from its own open state, not from a render
    // of this wrapper, so an effect here can run before the panel exists
    // (WebKit showed it: the effect saw no panel and the sheet never
    // dragged). The ref callback sees the node the moment it arrives.
    // Stable, or React would re-run it on every render of the content and
    // re-attach the drag in the middle of a gesture.
    const panelRef = useRef<HTMLDivElement | null>(null);
    const setPanelRef = useCallback(
      (node: HTMLDivElement | null) => {
        assignRef(forwardedRef, node);
        // Radix recomposes its refs on every render, so this is called with
        // null and the same node again and again; the drag stays attached
        // until a different node arrives.
        if (!node || node === panelRef.current) {
          return;
        }
        panelRef.current = node;
        detachDrag.current?.();
        detachDrag.current = undefined;
        if (isPhone) {
          detachDrag.current = attachSheetDrag(node, () => closeRef.current(), {
            scroller: () => scrollRef.current,
          });
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [isPhone],
    );

    return (
      <DropdownMenuPortal container={container}>
        <DropdownMenuContentRoot
          {...props}
          // A sheet has no keyboard to hand focus back to; the returned
          // focus only painted a ring on the trigger.
          onCloseAutoFocus={(event) => {
            props.onCloseAutoFocus?.(event);
            if (isPhone) {
              event.preventDefault();
            }
          }}
          ref={setPanelRef}
          className={classNames(
            styles.DropdownMenuContent,
            'overflow-hidden',
            variant === 'field'
              ? styles.DropdownMenuContentField
              : styles.DropdownMenuContentAction,
            isPhone && 'shell-menu-sheet',
            className,
          )}
          align={align}
          sideOffset={sideOffset ?? (variant === 'action' ? 6 : undefined)}
          collisionPadding={collisionPadding ?? 24}
        >
          <div
            ref={setScrollRef}
            className={classNames(
              styles.DropdownMenuScrollable,
              'overflow-y-auto bg-inherit',
              scrollableClassName ??
                (isPhone
                  ? 'max-h-[70vh]'
                  : 'max-h-[var(--radix-dropdown-menu-content-available-height)]'),
            )}
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
              wrapper={(children) => {
                const WrapperComponent = Wrapper!;
                return <WrapperComponent>{children}</WrapperComponent>;
              }}
            >
              <DropdownMenuItem
                onClick={action}
                key={label}
                disabled={disabled}
                aria-label={ariaLabel}
              >
                {anchorProps?.href ? (
                  <Link
                    href={anchorProps.href}
                    passHref
                    className={className}
                    role="menuitem"
                    {...anchorProps}
                  >
                    <a
                      className={className}
                      target={anchorProps?.target}
                      rel={anchorProps?.rel}
                    >
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
