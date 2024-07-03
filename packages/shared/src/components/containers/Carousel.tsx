import classNames from 'classnames';
import React, { ReactElement, ReactNode, useState } from 'react';
import { useSwipeable, SwipeCallback } from 'react-swipeable';
import { isNullOrUndefined } from '../../lib/func';
import CarouselIndicator from './CarouselIndicator';

interface ChildProps {
  onSwipedLeft: SwipeCallback;
  onSwipedRight: SwipeCallback;
  index: number;
}

interface ClassName {
  wrapper?: string;
  container?: string;
  item?: string;
}

export interface CarouselProps {
  items: ReactNode[];
  className?: ClassName;
  preSelectedIndex?: number;
  hasCustomIndicator?: boolean;
  onClose?: SwipeCallback;
  onEnd?: SwipeCallback;
  onScreenIndexChange?: (index: number) => void;
  children?: (props: ChildProps, stepIndicator: ReactNode) => ReactNode;
}

function Carousel({
  items,
  className = {},
  preSelectedIndex = 0,
  hasCustomIndicator = false,
  onScreenIndexChange,
  onClose,
  onEnd,
  children,
}: CarouselProps): ReactElement {
  const [index, setIndex] = useState(preSelectedIndex);

  const onUpdateIndex = (increment: number) => {
    onScreenIndexChange?.(index + increment);
    return setIndex((state) => state + increment);
  };

  const onSwipedRight: SwipeCallback = (e) => {
    e?.event?.stopPropagation?.();

    if (index === 0) {
      return isNullOrUndefined(e?.dir) && onClose?.(e);
    }

    return onUpdateIndex(-1);
  };

  const onSwipedLeft: SwipeCallback = (e) => {
    e?.event?.stopPropagation?.();

    const max = items.length - 1;
    if (index === max) {
      return isNullOrUndefined(e?.dir) && onEnd?.(e);
    }

    return onUpdateIndex(1);
  };

  const handlers = useSwipeable({ onSwipedLeft, onSwipedRight });
  const indicator = (
    <CarouselIndicator
      onItemClick={onUpdateIndex}
      max={items.length}
      active={index}
      className={{
        container: !children && 'absolute bottom-4 left-1/2 -translate-x-1/2',
      }}
    />
  );

  const content = (
    <span
      {...handlers}
      className={classNames(
        'relative flex flex-row overflow-x-hidden',
        className?.container,
        children ? 'w-[inherit]' : className?.wrapper,
      )}
    >
      {items.map((item, i) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          style={{ transform: `translateX(${-index * 100}%)` }}
          className={classNames(
            'w-[inherit] transform duration-500 ease-in-out',
            className?.item,
          )}
        >
          {item}
        </span>
      ))}
      {!hasCustomIndicator && indicator}
    </span>
  );

  if (!children) {
    return content;
  }

  return (
    <div className={classNames('flex flex-col', className?.wrapper)}>
      {content}
      {children?.({ onSwipedLeft, onSwipedRight, index }, indicator)}
    </div>
  );
}

export default Carousel;
