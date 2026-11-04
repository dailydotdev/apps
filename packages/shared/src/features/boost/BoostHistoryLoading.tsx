import React from 'react';
import { ElementPlaceholder } from '../../components/ElementPlaceholder';

const campaignPlaceholder = (
  <div className="flex w-full flex-row items-center gap-3 py-2">
    <ElementPlaceholder className="h-12 w-16 rounded-12" />
    <div className="flex h-full flex-1 flex-col justify-center gap-2">
      <ElementPlaceholder className="h-3 w-full rounded-8" />
      <ElementPlaceholder className="h-3 w-2/5 rounded-8" />
    </div>
    <ElementPlaceholder className="h-5 w-16 rounded-8" />
  </div>
);

export function BoostHistoryLoading(): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-2" aria-busy>
      {campaignPlaceholder}
      {campaignPlaceholder}
      {campaignPlaceholder}
    </div>
  );
}
