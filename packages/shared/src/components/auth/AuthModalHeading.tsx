import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';

interface AuthModalHeadingProps {
  tag?: keyof Pick<
    JSX.IntrinsicElements,
    'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  >;
  children?: ReactNode;
  className?: string;
  emoji?: string;
}

function AuthModalHeading({
  tag: Tag = 'h1',
  children,
  className,
  emoji,
}: AuthModalHeadingProps): ReactElement {
  return (
    <Tag
      className={classNames(
        'font-bold',
        emoji && 'flex flex-row items-center',
        className,
      )}
    >
      {emoji && <span className="mr-4 typo-giga3">{emoji}</span>}
      {children}
    </Tag>
  );
}

export default AuthModalHeading;
