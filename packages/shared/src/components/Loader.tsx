import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import styles from './Loader.module.css';

export interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  invertColor?: boolean;
}

export function Loader({
  className,
  invertColor,
  ...props
}: LoaderProps): ReactElement {
  return (
    <div {...props} className={classNames('w-5 h-5', className, styles.loader)}>
      <span
        className={classNames(styles.inner, invertColor && styles.invert)}
      />
    </div>
  );
}
