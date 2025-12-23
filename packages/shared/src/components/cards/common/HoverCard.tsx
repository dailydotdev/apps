import React, { useMemo, useRef, useState } from 'react';
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
  const isPointerInteractionRef = useRef(false);
  const ignoreKeyboardOpenRef = useRef(false);

  const callAll =
    <EventType,>(...fns: Array<((event: EventType) => void) | undefined>) =>
    (event: EventType) => {
      fns.forEach((fn) => {
        fn?.(event);
      });
    };

  const setPointerInteraction = (isPointer: boolean) => {
    isPointerInteractionRef.current = isPointer;
    if (isPointer) {
      ignoreKeyboardOpenRef.current = false;
    }
  };

  const handleFocus = () => {
    if (!isPointerInteractionRef.current) {
      ignoreKeyboardOpenRef.current = true;
    }
  };

  const handleBlur = () => {
    ignoreKeyboardOpenRef.current = false;
    isPointerInteractionRef.current = false;
  };

  const enhancedTrigger = useMemo(() => {
    if (!React.isValidElement(trigger)) {
      return trigger;
    }

    return React.cloneElement(trigger, {
      onFocus: callAll(trigger.props.onFocus, handleFocus),
      onBlur: callAll(trigger.props.onBlur, handleBlur),
      onPointerDown: callAll(trigger.props.onPointerDown, () =>
        setPointerInteraction(true),
      ),
      onPointerEnter: callAll(trigger.props.onPointerEnter, () =>
        setPointerInteraction(true),
      ),
      onPointerLeave: callAll(trigger.props.onPointerLeave, () =>
        setPointerInteraction(false),
      ),
    });
  }, [trigger]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && ignoreKeyboardOpenRef.current) {
      return;
    }

    setOpen(nextOpen);
  };

  return (
    <Root open={open} onOpenChange={handleOpenChange} openDelay={openDelay}>
      <Trigger asChild>{enhancedTrigger}</Trigger>
      <Portal container={appendTo || globalThis?.document?.body}>
        <Content {...props} className="z-modal" collisionPadding={{ top: 75 }}>
          {children}
        </Content>
      </Portal>
    </Root>
  );
};

export default HoverCard;
