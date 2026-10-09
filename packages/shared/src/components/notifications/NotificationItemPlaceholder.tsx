import type { ReactElement } from 'react';
import React from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { BodyTextPlaceholder, TextPlaceholder } from '../widgets/common';

export const NotificationItemPlaceholder = (): ReactElement => (
  <div className="flex min-h-[4.5rem] flex-row items-start gap-3 px-4 py-3">
    <div className="flex w-10 shrink-0 items-center">
      <ElementPlaceholder className="size-8 rounded-12" />
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <BodyTextPlaceholder className="my-[0.1875rem] w-3/4" />
      <TextPlaceholder className="w-1/2" />
    </div>
  </div>
);

interface NotificationListPlaceholderProps {
  amount?: number;
}

export const NotificationListPlaceholder = ({
  amount = 8,
}: NotificationListPlaceholderProps): ReactElement => (
  <div aria-busy>
    {Array.from({ length: amount }, (_, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <NotificationItemPlaceholder key={i} />
    ))}
  </div>
);
