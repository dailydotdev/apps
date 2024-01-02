import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import styles from './Loader.module.css';

export interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  invertColor?: boolean;
  innerClassName?: string;
}

export function Loader({
  className,
  invertColor,
  innerClassName,
  ...props
}: LoaderProps): ReactElement {
  return (
    <div
      {...props}
      className={classNames(
        'h-5 w-5',
        className,
        styles.loader,
        invertColor && 'invert',
      )}
    >
      <span
        className={classNames(
          styles.inner,
          invertColor && styles.invert,
          innerClassName,
        )}
      />
    </div>
  );
}
