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
    <RaisedLabel type={RaisedLabelType.Pinned} {...props} />
  </div>
);

const FlaggedContainer = ({
  children,
  labelProps,
}: FlaggedContainerProps): ReactElement =>
  getFlaggedContainer(children, labelProps);

export default FlaggedContainer;
