import React from 'react';

import { ElementPlaceholder } from '../../components/ElementPlaceholder';
import { IconSize } from '../../components/Icon';
import { ArrowIcon } from '../../components/icons';

const campaignPlaceholder = (
  <div className="flex w-full flex-row items-center gap-4 py-2">
    <ElementPlaceholder className="rounded-8 h-12 w-12" />
    <div className="flex h-full flex-1 flex-col justify-center gap-2">
      <ElementPlaceholder className="rounded-8 h-3 w-full" />
      <ElementPlaceholder className="rounded-8 h-3 w-3/5" />
    </div>
    <ArrowIcon
      size={IconSize.Medium}
      className="text-text-disabled rotate-90"
    />
  </div>
);

export function BoostHistoryLoading(): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-4">
      {campaignPlaceholder}
      {campaignPlaceholder}
    </div>
  );
}
