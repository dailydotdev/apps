import React, { ReactElement } from 'react';
import BlockIcon from '../../icons/Block';
import { IconSize } from '../../Icon';

export function BlockedMembersPlaceholder(): ReactElement {
  return (
    <div className="flex flex-col flex-1 justify-center items-center">
      <BlockIcon secondary size={IconSize.XXXLarge} />
      <p className="text-theme-label-secondary typo-body">
        No blocked members found
      </p>
    </div>
  );
}
