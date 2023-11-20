import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../../../lib/classed';
import styles from '../../../cards/Card.module.css';

const BasicCard = classed(
  'article',
  styles.card,
  'relative h-full flex flex-col rounded-2xl bg-theme-bg-secondary border border-theme-divider-tertiary hover:border-theme-divider-secondary shadow-2',
);

export function Card({ padding = true, children }): ReactElement {
  return (
    <BasicCard className={classNames(padding && 'p-2')}>{children}</BasicCard>
  );
}
