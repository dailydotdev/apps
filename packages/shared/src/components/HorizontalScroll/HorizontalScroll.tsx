import type { MutableRefObject, ReactElement, ReactNode } from 'react';
import React, { forwardRef, useId } from 'react';
import classNames from 'classnames';
import type { UseHorizontalScrollHeaderProps } from './useHorizontalScrollHeader';
import { useHorizontalScrollHeader } from './useHorizontalScrollHeader';

interface ClassName {
  container?: string;
  scroll?: string;
}

interface HorizontalScrollProps {
  children: ReactNode;
  className?: ClassName;
  scrollProps: UseHorizontalScrollHeaderProps;
}

function HorizontalScrollComponent(
  { children, className, scrollProps }: HorizontalScrollProps,
  propRef: MutableRefObject<HTMLDivElement>,
): ReactElement {
  const id = useId();
  const titleId = `horizontal-scroll-title-${id}`;
  const { ref, header } = useHorizontalScrollHeader({
    ...scrollProps,
    title: { ...scrollProps?.title, id: titleId },
  });

  return (
    <div
      className={classNames('flex flex-col', className?.container)}
      ref={propRef}
    >
      {header}
      <div
        ref={ref}
        className={classNames(
          'no-scrollbar grid auto-cols-max grid-flow-col overflow-x-scroll scroll-smooth',
          className?.scroll,
        )}
        role="region"
        aria-labelledby={titleId}
      >
        {children}
      </div>
    </div>
  );
}

const HorizontalScroll = forwardRef(HorizontalScrollComponent);

export default HorizontalScroll;
