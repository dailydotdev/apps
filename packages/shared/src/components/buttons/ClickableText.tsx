import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';

type AvailableTags = keyof Pick<JSX.IntrinsicElements, 'a' | 'button'>;

export interface BaseClickableTextProps {
  disabled?: boolean;
  pressed?: boolean;
  tag?: React.ElementType & AvailableTags;
  defaultTypo?: boolean;
  flexRowApplied?: boolean;
  underlined?: boolean;
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
    flexRowApplied = true,
    underlined = true,
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
        'items-center text-theme-label-tertiary cursor-pointer',
        flexRowApplied && 'flex flex-row',
        defaultTypo && 'typo-callout',
        pressed && 'text-theme-label-primary',
        isLink && 'text-theme-label-link',
        underlined && 'hover:underline focus:underline',
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
