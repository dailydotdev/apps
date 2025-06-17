import * as React from 'react';
import * as RadixPrimitive from '@radix-ui/react-tooltip';
import './styles.css';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { getCompanionWrapper } from '../../lib/extension';

export function Tooltip({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  appendTo,
  visible = true,
  ...props
}) {
  const { isCompanion } = useRequestProtocol();
  const container = isCompanion ? getCompanionWrapper() : appendTo;

  if (!visible) {
    return children;
  }

  return (
    <RadixPrimitive.Provider delayDuration={200}>
      <RadixPrimitive.Root>
        <RadixPrimitive.Trigger>{children}</RadixPrimitive.Trigger>
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
