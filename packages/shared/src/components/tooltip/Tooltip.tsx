import * as React from 'react';
import * as RadixPrimitive from '@radix-ui/react-tooltip';
import './styles.css';
import type { ReactNode } from 'react';
import type { TooltipContentProps } from '@radix-ui/react-tooltip';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { getCompanionWrapper } from '../../lib/extension';

export function Tooltip({
  children,
  content,
  appendTo,
  visible = true,
  ...props
}: Omit<TooltipContentProps, 'content'> & {
  appendTo?: Element | DocumentFragment;
  content: ReactNode;
  visible?: boolean;
}) {
  const { isCompanion } = useRequestProtocol();
  const container = isCompanion ? getCompanionWrapper() : appendTo;

  if (!visible) {
    return children;
  }

  return (
    <RadixPrimitive.Provider delayDuration={200}>
      <RadixPrimitive.Root>
        <RadixPrimitive.Trigger aria-label={content.toString()}>
          {children}
        </RadixPrimitive.Trigger>
        <RadixPrimitive.Portal
          container={container || globalThis?.document?.body}
        >
          <RadixPrimitive.Content
            className="TooltipContent z-tooltip rounded-10 bg-text-primary px-3 py-1 text-surface-invert typo-subhead"
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
