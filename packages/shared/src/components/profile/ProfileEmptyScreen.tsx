import React, { ReactElement } from 'react';
import classNames from 'classnames';

export interface ProfileEmptyScreenProps {
  text: string;
  title: string;
  className?: string;
  children?: ReactElement;
}

export function ProfileEmptyScreen({
  text,
  title,
  className,
  children,
}: ProfileEmptyScreenProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-col items-center gap-4 px-4 py-6 text-center',
        className,
      )}
    >
      <h3 className="font-bold typo-title3">{title}</h3>
      <p className="text-text-tertiary typo-callout">{text}</p>
      {children}
    </div>
  );
}
