import React, { LegacyRef, ReactElement } from 'react';
import classNames from 'classnames';

type AvailableTags = keyof Pick<JSX.IntrinsicElements, 'a' | 'button'>;

export interface BaseClickableTextProps {
  disabled?: boolean;
  pressed?: boolean;
  tag?: React.ElementType & AvailableTags;
  title: string;
}

export type ClickableTextProps<Tag extends AvailableTags> =
  BaseClickableTextProps &
    JSX.IntrinsicElements[Tag] & {
      innerRef?: LegacyRef<JSX.IntrinsicElements[Tag]>;
    };

// eslint-disable-next-line @typescript-eslint/no-redeclare
export function ClickableText<Tag extends AvailableTags>({
  disabled,
  pressed,
  title,
  children,
  tag: Tag = 'button',
  innerRef,
  className,
  ...props
}: ClickableTextProps<Tag>): ReactElement {
  const isLink = Tag === 'a';

  return (
    <Tag
      {...props}
      aria-pressed={pressed}
      ref={innerRef}
      className={classNames(
        'text-theme-label-tertiary typo-callout hover:underline focus:underline cursor-pointer',
        isLink && 'text-theme-label-link',
        pressed && 'text-theme-label-primary',
        disabled &&
          'text-theme-label-disabled pointer-events-none hover:no-underline',
        className,
      )}
    >
      {title}
    </Tag>
  );
}
