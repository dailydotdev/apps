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
        'flex flex-row items-center gap-1',
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
            'h-1.5 w-1.5 rounded-full border border-accent-salt-default',
            active === index && 'bg-accent-salt-default',
            className.item,
          )}
        />
      ))}
    </span>
  );
}

export default CarouselIndicator;
