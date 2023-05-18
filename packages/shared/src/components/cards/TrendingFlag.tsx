import React, { ReactElement } from 'react';
import { RaisedLabel, RaisedLabelType } from '.';

export function TrendingFlag({
  trending,
}: {
  trending: number;
}): ReactElement {
  console.log('trending', trending)
  return (
    <RaisedLabel
      type={RaisedLabelType.hot}
      description={`${trending} devs read it last hour`}
    />
  );
}
