import React, { ReactElement } from 'react';
import { BlockIcon } from '../../icons';
import { IconSize } from '../../Icon';

export function BlockedMembersPlaceholder(): ReactElement {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <BlockIcon secondary size={IconSize.XXXLarge} />
      <p className="text-text-secondary typo-body">No blocked members found</p>
    </div>
  );
}
