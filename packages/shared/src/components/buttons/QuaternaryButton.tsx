import React, { forwardRef, Ref, useRef, useState } from 'react';
import classNames from 'classnames';
import { ForwardedButton, AllowedTags, ButtonProps } from './Button';

type QuandaryButtonProps = {
  id: string;
  reverse?: boolean;
  responsiveLabelClass?: string;
};

export const QuaternaryButton: React.ForwardRefRenderFunction<
  HTMLDivElement,
  ButtonProps<AllowedTags> & QuandaryButtonProps
> = <TagName extends AllowedTags>(
  {
    id,
    children,
    style,
    className,
    reverse,
    responsiveLabelClass,
    tag = 'button',
    ...props
  }: ButtonProps<TagName> & QuandaryButtonProps,
  ref?: Ref<HTMLDivElement>,
) => {
  const buttonRef = useRef<HTMLAnchorElement>();
  const [isHovered, setIsHovered] = useState(false);
  const onLabelClick = (event: React.MouseEvent<HTMLLabelElement>): void => {
    event.preventDefault();
    buttonRef?.current.click();
  };
  const labelProps = {
    onMouseOver: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onClick: onLabelClick,
  };
  const labelDisplay = responsiveLabelClass
    ? `hidden ${responsiveLabelClass}`
    : 'flex';

  return (
    <div
      style={style}
      className={classNames(
        { reverse },
        props.buttonSize,
        'btn-quaternary',
        'flex',
        'flex-row',
        'items-stretch',
        'select-none',
        className,
      )}
      ref={ref}
    >
      <ForwardedButton
        {...props}
        id={id}
        tag={tag}
        ref={buttonRef}
        className={classNames(tag === 'a' && isHovered && 'hover')}
      />
      {children && (
        <label
          htmlFor={id}
          {...(tag === 'a' ? labelProps : {})}
          className={`${labelDisplay} items-center font-bold cursor-pointer typo-callout`}
        >
          {children}
        </label>
      )}
    </div>
  );
};

export const ForwardedQuaternaryButton = forwardRef(QuaternaryButton);
