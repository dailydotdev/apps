import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import styles from '../styles/loader.module.css';

export default function Loader(
  props: HTMLAttributes<HTMLDivElement>,
): ReactElement {
  return (
    <div
      {...props}
      className={classNames('w-5 h-5', props?.className, styles.loader)}
    >
      <span className={styles.inner} />
    </div>
  );
}
