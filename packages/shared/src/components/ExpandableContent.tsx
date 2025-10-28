import type { ReactElement, ReactNode } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from './buttons/Button';
import { MoveToIcon } from './icons';
import { IconSize } from './Icon';

export interface ExpandableContentProps {
  children: ReactNode;
  maxHeight?: number; // in pixels
  className?: string;
}

const DEFAULT_MAX_HEIGHT = 320; // pixels

export function ExpandableContent({
  children,
  maxHeight = DEFAULT_MAX_HEIGHT,
  className,
}: ExpandableContentProps): ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (measureRef.current) {
      const contentHeight = measureRef.current.scrollHeight;
      setShowSeeMore(contentHeight > maxHeight);
    }
  }, [maxHeight]);

  return (
    <>
      {/* Hidden div for measuring actual content height */}
      <div
        ref={measureRef}
        className="pointer-events-none invisible absolute"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Visible content */}
      <div
        ref={contentRef}
        className={classNames(
          'relative transition-all duration-500 ease-in-out',
          {
            'overflow-hidden': !isExpanded,
          },
          className,
        )}
        style={{
          maxHeight: !isExpanded ? `${maxHeight}px` : undefined,
        }}
      >
        {children}
        {!isExpanded && showSeeMore && (
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-background-default" />
        )}
      </div>

      {showSeeMore && !isExpanded && (
        <div className="mt-4 flex w-full items-center justify-center">
          <Button
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Medium}
            onClick={() => setIsExpanded(true)}
            icon={<MoveToIcon size={IconSize.XSmall} className="rotate-90" />}
            iconPosition={ButtonIconPosition.Right}
          >
            See More
          </Button>
        </div>
      )}
    </>
  );
}
