import React, { ReactElement } from 'react';
import { Card } from '../common/Card';
import { AcquisitionFormInner } from './common/AcquisitionFormInner';

export function AcquisitionFormGrid(): ReactElement {
  return (
    <Card data-testid="acquisitionFormCard" className="p-4">
      <AcquisitionFormInner className={{ button: 'mt-auto' }} />
    </Card>
  );
}
