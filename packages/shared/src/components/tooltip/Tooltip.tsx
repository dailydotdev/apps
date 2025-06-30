import * as React from 'react';
import * as RadixPrimitive from '@radix-ui/react-tooltip';
import './styles.css';
import type { ReactNode } from 'react';
import type {
  TooltipContentProps,
  TooltipProviderProps,
} from '@radix-ui/react-tooltip';
import classNames from 'classnames';
import { useState } from 'react';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { getCompanionWrapper } from '../../lib/extension';

export type TooltipProps = TooltipProviderProps &
  Omit<TooltipContentProps, 'content'> & {
    appendTo?: Element | DocumentFragment;
    content: ReactNode;
    visible?: boolean;
    enableMobileClick?: boolean;
  };
export function Tooltip({
  children,
  content,
  appendTo,
  visible = true,
  delayDuration = 200,
  className,
  enableMobileClick,
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
      <RadixPrimitive.Root open={open} onOpenChange={setOpen}>
        <RadixPrimitive.Trigger
          aria-label={showAriaLabel && content.toString()}
          asChild
          {...(enableMobileClick && { onClick: () => setOpen(true) })}
        >
          {children}
        </RadixPrimitive.Trigger>
        <RadixPrimitive.Portal
          container={container || globalThis?.document?.body}
        >
          <RadixPrimitive.Content
            className={classNames(
              'TooltipContent z-tooltip max-w-full rounded-10 bg-text-primary px-3 py-1 text-surface-invert typo-subhead',
              className,
            )}
            sideOffset={5}
            collisionPadding={{ top: 75 }}
            {...props}
          >
            {content}
            <RadixPrimitive.Arrow className="TooltipArrow fill-text-primary" />
          </RadixPrimitive.Content>
        </RadixPrimitive.Portal>
      </RadixPrimitive.Root>
    </RadixPrimitive.Provider>
  );
}
