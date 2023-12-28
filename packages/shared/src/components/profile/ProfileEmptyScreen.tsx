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
        'flex flex-col gap-4 text-center items-center py-6 px-4',
        className,
      )}
    >
      <h3 className="font-bold typo-title3">{title}</h3>
      <p className="typo-callout text-theme-label-tertiary">{text}</p>
      {children}
    </div>
  );
}
