import type { ReactElement } from 'react';
import React from 'react';
import { Card } from '../common/Card';
import type { AcquisitionFormProps } from './common/AcquisitionFormInner';
import { AcquisitionFormInner } from './common/AcquisitionFormInner';

export function AcquisitionFormGrid({
  answerStyle,
}: AcquisitionFormProps): ReactElement {
  return (
    <Card data-testid="acquisitionFormCard" className="p-4">
      <AcquisitionFormInner
        answerStyle={answerStyle}
        className={{ button: 'mt-auto' }}
      />
    </Card>
  );
}
