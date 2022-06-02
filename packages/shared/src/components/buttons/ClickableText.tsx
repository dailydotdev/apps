import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';

type AvailableTags = keyof Pick<JSX.IntrinsicElements, 'a' | 'button'>;

export interface BaseClickableTextProps {
  disabled?: boolean;
  pressed?: boolean;
  tag?: React.ElementType & AvailableTags;
  defaultTypo?: boolean;
  textClassName?: string;
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
        'flex flex-row items-center text-theme-label-tertiary cursor-pointer hover:underline focus:underline',
        defaultTypo && 'typo-callout',
        pressed && 'text-theme-label-primary',
        isLink && (textClassName || 'text-theme-label-link'),
        disabled &&
          'text-theme-label-disabled pointer-events-none hover:no-underline',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export const ClickableText = forwardRef(ClickableTextComponent);
