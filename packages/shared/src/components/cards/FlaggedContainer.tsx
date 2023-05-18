import React, { ReactElement, ReactNode } from 'react';
import styles from './Card.module.css';
import { RaisedLabel, RaisedLabelProps, RaisedLabelType } from './RaisedLabel';

interface FlaggedContainerProps {
  children: ReactNode;
  labelProps: RaisedLabelProps;
}

export const getFlaggedContainer = (
  children: ReactNode,
  props: Partial<RaisedLabelProps> = {},
): ReactElement => (
  <div className={`relative ${styles.cardContainer}`}>
    {children}
    <RaisedLabel type={RaisedLabelType.pinned} {...props} />
  </div>
);

export const getTrendingFlag = (
  children: ReactNode,
  trending: number,
  listMode?: boolean,
) =>
  getFlaggedContainer(children, {
    listMode,
    type: RaisedLabelType.hot,
    description: `${trending} devs read it last hour`,
  });

const FlaggedContainer = ({
  children,
  labelProps,
}: FlaggedContainerProps): ReactElement =>
  getFlaggedContainer(children, labelProps);

export default FlaggedContainer;
