import React, { ReactElement } from 'react';
import { RaisedLabel, RaisedLabelType } from './RaisedLabel';

interface TrendingFlagProps {
  trending: number;
  listMode?: boolean;
}

export function TrendingFlag({
  trending,
  listMode,
}: TrendingFlagProps): ReactElement {
  return (
    <RaisedLabel
      type={RaisedLabelType.Hot}
      description={`${trending} devs read it last hour`}
      listMode={listMode}
    />
  );
}
