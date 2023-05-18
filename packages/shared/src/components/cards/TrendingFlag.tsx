import React, { ReactElement } from 'react';
import { RaisedLabel, RaisedLabelType } from './RaisedLabel';

export function TrendingFlag({ trending }: { trending: number }): ReactElement {
  return (
    <RaisedLabel
      type={RaisedLabelType.hot}
      description={`${trending} devs read it last hour`}
    />
  );
}
