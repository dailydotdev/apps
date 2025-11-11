import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';

type AvailableTags = keyof Pick<JSX.IntrinsicElements, 'a' | 'button'>;

export interface BaseClickableTextProps {
  disabled?: boolean;
  pressed?: boolean;
  tag?: React.ElementType & AvailableTags;
  defaultTypo?: boolean;
  textClassName?: string;
  inverseUnderline?: boolean;
}

export type ClickableTextProps<Tag extends AvailableTags> =
  BaseClickableTextProps & JSX.IntrinsicElements[Tag];

// eslint-disable-next-line @typescript-eslint/no-redeclare
function ClickableTextComponent<Tag extends AvailableTags>(
  {
    disabled,
    pressed,
    children,
    tag: Tag = 'button',
    defaultTypo = true,
    textClassName,
    inverseUnderline,
    className,
    ...props
  }: ClickableTextProps<Tag>,
  ref: Ref<HTMLButtonElement>,
): ReactElement {
  const isLink = Tag === 'a';

  return (
    <Tag
      {...props}
      aria-pressed={pressed}
      ref={ref}
      className={classNames(
        'text-text-tertiary flex cursor-pointer flex-row items-center hover:underline focus:underline',
        inverseUnderline
          ? 'underline hover:no-underline focus:no-underline'
          : 'hover:underline focus:underline',
        defaultTypo && 'typo-callout',
        pressed && 'text-text-primary',
        isLink && (textClassName || '!text-text-link'),
        disabled && 'text-text-disabled pointer-events-none hover:no-underline',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export const ClickableText = forwardRef(ClickableTextComponent);
