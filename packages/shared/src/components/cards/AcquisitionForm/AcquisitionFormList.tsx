import type { ReactElement } from 'react';
import React from 'react';
import { ListCard } from '../common/list/ListCard';
import type { AcquisitionFormProps } from './common/AcquisitionFormInner';
import { AcquisitionFormInner } from './common/AcquisitionFormInner';

export function AcquisitionFormList({
  answerStyle,
}: AcquisitionFormProps): ReactElement {
  return (
    <ListCard data-testid="acquisitionFormCard" className="p-4">
      <AcquisitionFormInner
        answerStyle={answerStyle}
        className={{ button: 'mt-4' }}
      />
    </ListCard>
  );
}
