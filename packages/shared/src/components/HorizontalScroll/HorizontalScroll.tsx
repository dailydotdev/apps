import React, {
  ReactElement,
  ReactNode,
  RefObject,
  MouseEventHandler,
} from 'react';
import classNames from 'classnames';
import { useHorizontalScrollHeader } from './useHorizontalScrollHeader';

interface HorizontalScrollProps {
  title: string | ReactElement;
  children: ReactNode;
  onScroll?: (ref: RefObject<HTMLElement>) => void;
  onClickSeeAll?: MouseEventHandler;
  className?: string;
}

export default function HorizontalScroll({
  title,
  children,
  onScroll,
  onClickSeeAll,
  className,
}: HorizontalScrollProps): ReactElement {
  const { ref, Header } = useHorizontalScrollHeader({
    title,
    onScroll,
    onClickSeeAll,
  });

  const titleId = `horizontal-scroll-title-${Math.random()}`;

  return (
    <>
      <Header titleId={titleId} />
      <div
        ref={ref}
        className={classNames(
          'no-scrollbar grid auto-cols-max grid-flow-col overflow-x-scroll scroll-smooth',
          className,
        )}
        role="region"
        aria-labelledby={titleId}
      >
        {children}
      </div>
    </>
  );
}
