import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import styles from './Loader.module.css';

export function Loader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactElement {
  return (
    <div {...props} className={classNames('w-5 h-5', className, styles.loader)}>
      <span className={styles.inner} />
    </div>
  );
}
