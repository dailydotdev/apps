import classNames from 'classnames';
import React, { ReactElement, ReactNode, useState } from 'react';
import { useSwipeable, SwipeCallback } from 'react-swipeable';
import CarouselIndicator from './CarouselIndicator';

interface ChildProps {
  onSwipedLeft: SwipeCallback;
  onSwipedRight: SwipeCallback;
  onIndicatorClick: (index: number) => void;
  index: number;
}

interface ClassName {
  container?: string;
  item?: string;
}

interface CarouselProps {
  items: ReactNode[];
  className?: ClassName;
  preSelectedIndex?: number;
  hasCustomIndicator?: boolean;
  onClose?: SwipeCallback;
  children?: (props: ChildProps, stepIndicator: ReactNode) => void;
}

function Carousel({
  items,
  className = {},
  preSelectedIndex = 0,
  hasCustomIndicator = false,
  onClose,
  children,
}: CarouselProps): ReactElement {
  const [index, setIndex] = useState(preSelectedIndex);
  const onSwipedRight: SwipeCallback = (e) => {
    e?.event?.stopPropagation?.();

    if (index === 0) return onClose?.(e);

    return setIndex((state) => state - 1);
  };

  const onSwipedLeft: SwipeCallback = (e) => {
    e?.event?.stopPropagation?.();

    if (index === items.length - 1) return null;

    return setIndex((state) => state + 1);
  };

  const onIndicatorClick = (position: number) => {
    return setIndex(position);
  };

  const handlers = useSwipeable({ onSwipedLeft, onSwipedRight });
  const indicator = (
    <CarouselIndicator
      onItemClick={onIndicatorClick}
      max={items.length}
      active={index}
      className={{
        container: 'absolute bottom-4 left-1/2 -translate-x-1/2',
      }}
    />
  );

  const content = (
    <span
      {...handlers}
      className={classNames(
        'relative flex flex-row overflow-x-hidden',
        className?.container,
      )}
    >
      {items.map((item, i) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          style={{ transform: `translateX(${-index * 100}%)` }}
          className={classNames(
            'w-[inherit] transform ease-in-out duration-500',
            className?.item,
          )}
        >
          {item}
        </span>
      ))}
      {!hasCustomIndicator && indicator}
    </span>
  );

  if (!children) return content;

  return (
    <div className="flex flex-col">
      {content}
      {children?.(
        { onSwipedLeft, onSwipedRight, onIndicatorClick, index },
        indicator,
      )}
    </div>
  );
}

export default Carousel;
