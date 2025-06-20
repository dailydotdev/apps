import React, { useState } from 'react';
import type { HoverCardContentProps } from '@radix-ui/react-hover-card';
import { Root, Trigger, Portal, Content } from '@radix-ui/react-hover-card';

type HoverCardProps = HoverCardContentProps & {
  appendTo?: Element | DocumentFragment;
  trigger?: React.ReactNode;
  alignOffset?: number;
  sideOffset?: number;
  openDelay?: number;
};

const HoverCard = ({
  children,
  appendTo,
  trigger,
  openDelay = 200,
  ...props
}: HoverCardProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Root open={open} onOpenChange={setOpen} openDelay={openDelay}>
      <Trigger asChild>{trigger}</Trigger>
      <Portal container={appendTo || globalThis?.document?.body}>
        <Content {...props} className="z-modal" collisionPadding={{ top: 75 }}>
          {children}
        </Content>
      </Portal>
    </Root>
  );
};

export default HoverCard;
