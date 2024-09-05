import classNames from 'classnames';
import React, {
  MouseEventHandler,
  ReactElement,
  ReactNode,
  RefObject,
  useId,
} from 'react';

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

  const id = useId();
  const titleId = `horizontal-scroll-title-${id}`;

  return (
    <div className="flex flex-col">
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
    </div>
  );
}
