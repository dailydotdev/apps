import * as React from 'react';
import * as RadixPrimitive from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
import type {
  TooltipContentProps,
  TooltipProviderProps,
  TooltipProps as RadixTooltipProps,
} from '@radix-ui/react-tooltip';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './styles.module.css';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { getCompanionWrapper } from '../../lib/extension';
import { isNullOrUndefined } from '../../lib/func';

export type TooltipProps = TooltipProviderProps &
  Omit<TooltipContentProps, 'content'> &
  Pick<RadixTooltipProps, 'open'> & {
    appendTo?: Element | DocumentFragment;
    content: ReactNode;
    visible?: boolean;
    enableMobileClick?: boolean;
    // Arrow is off by default for a cleaner look (Linear/ChatGPT style). Opt in
    // when the anchor is ambiguous.
    showArrow?: boolean;
  };
export function Tooltip({
  children,
  content,
  appendTo,
  visible = true,
  delayDuration = 200,
  className,
  enableMobileClick,
  open: controlledOpen,
  showArrow = false,
  ...props
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const { isCompanion } = useRequestProtocol();
  const container = isCompanion ? getCompanionWrapper() : appendTo;
  const showAriaLabel = typeof content === 'string';
  if (!visible) {
    return children;
  }

  return (
    <RadixPrimitive.Provider delayDuration={delayDuration}>
      <RadixPrimitive.Root
        open={isNullOrUndefined(controlledOpen) ? open : controlledOpen}
        onOpenChange={setOpen}
      >
        <RadixPrimitive.Trigger
          aria-label={showAriaLabel ? content.toString() : undefined}
          asChild
          onMouseUp={(e: React.MouseEvent) =>
            (e.currentTarget as HTMLElement).blur()
          }
          {...(enableMobileClick && { onClick: () => setOpen(true) })}
        >
          {children}
        </RadixPrimitive.Trigger>
        <RadixPrimitive.Portal
          container={container || globalThis?.document?.body}
        >
          <RadixPrimitive.Content
            // The default `flex items-center gap-1.5` lays out simple content
            // (leading icon + label + trailing shortcut). Full-bleed custom
            // tooltips pass a single self-contained child and override the
            // surface via className; the flex wrapper is a no-op around one item.
            className={classNames(
              styles.TooltipContent,
              'z-tooltip flex max-w-[18rem] items-center gap-1.5 rounded-8 border border-border-subtlest-tertiary bg-background-subtle px-2 py-1 text-text-primary shadow-2 typo-caption1 font-medium',
              className,
            )}
            sideOffset={5}
            collisionPadding={{ top: 75 }}
            {...props}
          >
            {content}
            {showArrow && (
              <RadixPrimitive.Arrow className="TooltipArrow fill-background-subtle" />
            )}
          </RadixPrimitive.Content>
        </RadixPrimitive.Portal>
      </RadixPrimitive.Root>
    </RadixPrimitive.Provider>
  );
}
