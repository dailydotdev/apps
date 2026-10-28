import type { ReactElement, ReactNode, RefObject } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { IconSize } from '../../components/Icon';
import { ElementPlaceholder } from '../../components/ElementPlaceholder';
import type { FeedWidgetKind } from './types';
import { FeedWidgetIcon } from './registry';

/**
 * Edit mode takes a widget's content out of reach: `pointer-events-none`
 * would still let through the card buttons that opt back in with
 * `pointer-events-auto`, and the keyboard. Set as a property because React 18
 * does not carry the attribute.
 */
export const useInert = <T extends HTMLElement>(
  ref: RefObject<T>,
  isInert: boolean,
): void => {
  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return undefined;
    }

    node.inert = isInert;
    return () => {
      node.inert = false;
    };
  }, [ref, isInert]);
};

export const useInertRef = <T extends HTMLElement>(
  isInert: boolean,
): RefObject<T> => {
  const ref = useRef<T>(null);
  useInert(ref, isInert);

  return ref;
};

/**
 * The one surface every widget sits on. A widget that is itself a card (a
 * post card, the ad) is bare: its own frame is the surface.
 */
export const FeedWidgetSurface = ({
  children,
  className,
  isBare,
  isInert = false,
}: {
  children: ReactNode;
  className?: string;
  isBare?: boolean;
  isInert?: boolean;
}): ReactElement => {
  const ref = useInertRef<HTMLDivElement>(isInert);

  return (
    <div
      ref={ref}
      className={classNames(
        'relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-16',
        !isBare &&
          'border border-border-subtlest-tertiary bg-background-subtle py-3',
        className,
      )}
    >
      {children}
    </div>
  );
};

const PendingRows = (): ReactElement => (
  <div className="flex flex-1 flex-col gap-3 px-4" aria-busy>
    <ElementPlaceholder className="h-5 w-2/5 rounded-8" />
    <ElementPlaceholder className="h-4 w-full rounded-8" />
    <ElementPlaceholder className="h-4 w-4/5 rounded-8" />
    <ElementPlaceholder className="h-4 w-3/5 rounded-8" />
  </div>
);

/** What a widget's cell shows while the widget's own code loads. */
export const FeedWidgetLoading = (): ReactElement => <PendingRows />;

/** What a widget shows while its data loads, and when there is none. */
export const FeedWidgetEmpty = ({
  kind,
  isPending,
  message,
}: {
  kind: FeedWidgetKind;
  isPending?: boolean;
  message: string;
}): ReactElement => {
  if (isPending) {
    return <PendingRows />;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center text-text-tertiary">
      <FeedWidgetIcon kind={kind} size={IconSize.Large} />
      <span className="typo-footnote">{message}</span>
    </div>
  );
};
