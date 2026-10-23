import type { ReactElement } from 'react';
import React from 'react';
import { ListCard } from '../common/list/ListCard';
import { AcquisitionFormInner } from './common/AcquisitionFormInner';

export function AcquisitionFormList(): ReactElement {
  return (
    <ListCard data-testid="acquisitionFormCard" className="p-4">
      <AcquisitionFormInner className={{ button: 'mt-4' }} />
    </ListCard>
  );
}
