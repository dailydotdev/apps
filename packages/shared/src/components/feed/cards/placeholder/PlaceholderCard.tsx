import React, { ReactElement } from 'react';
import { CardSpace, CardTextContainer } from '../../../cards/Card';
import { ElementPlaceholder } from '../../../ElementPlaceholder';
import { CardContainer } from '../atoms/CardContainer';
import { Card } from '../atoms/Card';
import classed from '../../../../lib/classed';

const Text = classed(ElementPlaceholder, 'h-3 rounded-16 my-2');

export const PlaceholderCard = (): ReactElement => {
  return (
    <CardContainer>
      <Card>
        <CardTextContainer>
          <ElementPlaceholder className="my-2 h-6 w-6 rounded-full" />
          <Text style={{ width: '100%' }} />
          <Text style={{ width: '100%' }} />
          <Text style={{ width: '80%' }} />
        </CardTextContainer>
        <CardSpace className="my-2" />
        <ElementPlaceholder className="my-2 h-40 rounded-16" />
        <CardTextContainer>
          <Text style={{ width: '32%' }} />
        </CardTextContainer>
      </Card>
    </CardContainer>
  );
};
