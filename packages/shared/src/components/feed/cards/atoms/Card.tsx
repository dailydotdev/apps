import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../../../lib/classed';
import styles from '../../../cards/Card.module.css';

const BasicCard = classed(
  'article',
  styles.card,
  'relative flex flex-col rounded-16',
);

type CardProps = {
  height?: string;
  background?: string;
  border?: string;
  padding?: string;
  shadow?: boolean;
  className?: string;
  children?: React.ReactNode;
};
export function Card({
  height = 'h-full',
  background = 'bg-background-subtle',
  border = 'border border-theme-divider-tertiary hover:border-theme-divider-secondary',
  padding = 'p-2',
  shadow = true,
  className = '',
  children,
}: CardProps): ReactElement {
  return (
    <BasicCard
      className={classNames(
        height,
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
