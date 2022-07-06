import React, {
  forwardRef,
  ReactElement,
  Ref,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { Button, AllowedTags, ButtonProps, ButtonElementType } from './Button';

type QuandaryButtonProps = {
  id: string;
  reverse?: boolean;
  responsiveLabelClass?: string;
};

function QuaternaryButtonComponent<TagName extends AllowedTags>(
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
  const labelDisplay = responsiveLabelClass ?? 'flex';

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
            'items-center font-bold cursor-pointer typo-callout',
            labelDisplay,
            { readOnly: props.readOnly },
          )}
        >
          {children}
        </label>
      )}
    </div>
  );
}

export const QuaternaryButton = forwardRef(QuaternaryButtonComponent);
