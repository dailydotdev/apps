import React, {
  forwardRef,
  MutableRefObject,
  ReactElement,
  ReactNode,
  useId,
  useMemo,
} from 'react';
import classNames from 'classnames';
import {
  UseHorizontalScrollHeaderProps,
  useHorizontalScrollHeader,
} from './useHorizontalScrollHeader';

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
  const props = useMemo(
    () => ({ ...scrollProps, title: { ...scrollProps?.title, id: titleId } }),
    [scrollProps, titleId],
  );
  const { ref, header } = useHorizontalScrollHeader(props);

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
