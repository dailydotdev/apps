import type { ReactElement, ReactNode, UIEvent } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';

const fadeMask = (isScrolled: boolean): string =>
  `linear-gradient(to bottom, ${
    isScrolled ? 'transparent 0, black 2.5rem' : 'black 0'
  }, black calc(100% - 2.5rem), transparent 100%)`;

const edgeClassName =
  'pointer-events-none sticky z-2 block h-10 backdrop-blur-[3px] transition-opacity duration-150 motion-reduce:transition-none';

/**
 * A widget's content area: it runs to the widget's bottom edge and scrolls
 * inside. Both edges dissolve, a mask fading the content and a thin blur
 * softening it, so the rows slide under the header instead of being cut by
 * it. The top edge only appears once the list has moved.
 */
export const Scroll = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => {
  const [isScrolled, setIsScrolled] = useState(false);
  const onScroll = (event: UIEvent<HTMLDivElement>) =>
    setIsScrolled(event.currentTarget.scrollTop > 2);
  const mask = fadeMask(isScrolled);

  return (
    <div
      onScroll={onScroll}
      className={classNames(
        'no-scrollbar relative -mb-4 mt-2 min-h-0 flex-1 overflow-y-auto pb-6',
        className,
      )}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      <span
        aria-hidden
        className={classNames(
          edgeClassName,
          'top-0 -mb-10 [mask-image:linear-gradient(to_bottom,black,transparent)]',
          isScrolled ? 'opacity-100' : 'opacity-0',
        )}
      />
      {children}
      <span
        aria-hidden
        className={classNames(
          edgeClassName,
          'bottom-0 -mt-10 [mask-image:linear-gradient(to_top,black,transparent)]',
        )}
      />
    </div>
  );
};
