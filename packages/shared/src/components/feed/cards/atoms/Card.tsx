import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../../../lib/classed';
import styles from '../../../cards/Card.module.css';

const BasicCard = classed(
  'article',
  styles.card,
  'relative  flex flex-col rounded-2xl',
);

export function Card({
  background = 'bg-theme-bg-secondary',
  border = 'border border-theme-divider-tertiary hover:border-theme-divider-secondary',
  padding = 'p-2',
  shadow = true,
  className = '',
  children,
}): ReactElement {
  return (
    <BasicCard
      className={classNames(
        padding,
        shadow && 'shadow-2',
        background,
        border,
        className,
      )}
    >
      {children}
    </BasicCard>
  );
}
