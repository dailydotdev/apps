import type { ReactElement, Ref } from 'react';
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import type { AllowedTags, ButtonElementType, ButtonProps } from './Button';
import { Button } from './Button';

export type QuaternaryButtonProps<TagName extends AllowedTags> =
  ButtonProps<TagName> & {
    reverse?: boolean;
    labelClassName?: string;
  };

function QuaternaryButtonComponent<TagName extends AllowedTags>(
  {
    id,
    children,
    style,
    className,
    reverse,
    tag = 'button',
    labelClassName,
    ...props
  }: QuaternaryButtonProps<TagName>,
  ref?: Ref<ButtonElementType<TagName>>,
): ReactElement {
  const anchorRef = useRef<ButtonElementType<TagName>>(null);
  useImperativeHandle(ref, () => anchorRef?.current);
  const [isHovered, setIsHovered] = useState(false);
  const onLabelClick = (event: React.MouseEvent<HTMLLabelElement>): void => {
    event.preventDefault();
    anchorRef?.current?.click();
  };
  const labelProps =
    tag === 'a'
      ? {
          onMouseOver: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
          onClick: onLabelClick,
        }
      : {};
  return (
    <div
      style={style}
      className={classNames(
        { reverse },
        props.size,
        'btn-quaternary',
        'flex',
        'flex-row',
        'items-stretch',
        'select-none',
        className,
      )}
    >
      <Button
        {...props}
        id={id}
        tag={tag}
        ref={anchorRef}
        className={classNames(tag === 'a' && isHovered && 'hover')}
      />
      {children && (
        <label
          htmlFor={id}
          {...labelProps}
          className={classNames(
            'flex cursor-pointer items-center pl-1 font-bold typo-callout',
            { readOnly: props.disabled },
            labelClassName,
          )}
        >
          {children}
        </label>
      )}
    </div>
  );
}

export const QuaternaryButton = forwardRef(QuaternaryButtonComponent);
