import React from 'react';
import type { HoverCardContentProps } from '@radix-ui/react-hover-card';
import { Root, Trigger, Portal, Content } from '@radix-ui/react-hover-card';

type HoverCardProps = HoverCardContentProps & {
  appendTo?: Element | DocumentFragment;
  open?: boolean;
  trigger?: React.ReactNode;
  alignOffset?: number;
  sideOffset?: number;
};

const HoverCard = ({
  children,
  appendTo,
  open,
  trigger,
  ...props
}: HoverCardProps) => {
  return (
    <Root open={open}>
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
