import React, { forwardRef, ReactElement, Ref } from 'react';
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
        'flex cursor-pointer flex-row items-center text-text-tertiary hover:underline focus:underline',
        inverseUnderline
          ? 'underline hover:no-underline focus:no-underline'
          : 'hover:underline focus:underline',
        defaultTypo && 'typo-callout',
        pressed && 'text-text-primary',
        isLink && (textClassName || '!text-text-link'),
        disabled && 'pointer-events-none text-text-disabled hover:no-underline',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export const ClickableText = forwardRef(ClickableTextComponent);
