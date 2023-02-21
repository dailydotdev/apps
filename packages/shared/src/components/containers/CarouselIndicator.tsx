import classNames from 'classnames';
import React, { ReactElement, useMemo } from 'react';

interface ClassName {
  container?: string;
  item?: string;
}

interface CarouselIndicatorProps {
  active: number;
  max: number;
  className?: ClassName;
  onItemClick: (index: number) => void;
}

function CarouselIndicator({
  max,
  active,
  className = {},
  onItemClick,
}: CarouselIndicatorProps): ReactElement {
  const items = useMemo(() => Array(max).fill(null), [max]);

  return (
    <span
      className={classNames(
        'flex flex-row gap-1 items-center',
        className.container,
      )}
    >
      {items.map((_, index) => (
        <button
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          type="button"
          aria-label={`carousel item #${index + 1}`}
          onClick={() => onItemClick(index)}
          className={classNames(
            'w-1.5 h-1.5 rounded-full border border-theme-color-salt',
            active === index && 'bg-theme-color-salt',
            className.item,
          )}
        />
      ))}
    </span>
  );
}

export default CarouselIndicator;
