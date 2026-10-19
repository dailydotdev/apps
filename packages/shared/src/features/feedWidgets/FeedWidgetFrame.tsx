import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../../components/Icon';
import { ElementPlaceholder } from '../../components/ElementPlaceholder';
import type { FeedWidgetKind } from './types';
import { FeedWidgetIcon } from './registry';

/**
 * The one surface every widget sits on. A widget that is itself a card (a
 * post card, the ad) is bare: its own frame is the surface.
 */
export const FeedWidgetSurface = ({
  children,
  className,
  isBare,
}: {
  children: ReactNode;
  className?: string;
  isBare?: boolean;
}): ReactElement => (
  <div
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
    return (
      <div className="flex flex-1 flex-col gap-3 px-4" aria-busy>
        <ElementPlaceholder className="h-5 w-2/5 rounded-8" />
        <ElementPlaceholder className="h-4 w-full rounded-8" />
        <ElementPlaceholder className="h-4 w-4/5 rounded-8" />
        <ElementPlaceholder className="h-4 w-3/5 rounded-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center text-text-tertiary">
      <FeedWidgetIcon kind={kind} size={IconSize.Large} />
      <span className="typo-footnote">{message}</span>
    </div>
  );
};
