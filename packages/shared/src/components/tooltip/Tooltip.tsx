import * as React from 'react';
import * as RadixPrimitive from '@radix-ui/react-tooltip';
import './styles.css';

export function Tooltip({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  ...props
}) {
  return (
    <RadixPrimitive.Provider delayDuration={200}>
      <RadixPrimitive.Root>
        <RadixPrimitive.Trigger>{children}</RadixPrimitive.Trigger>
        <RadixPrimitive.Portal>
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
