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
    buttonClassName?: string;
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
    buttonClassName,
    ...props
  }: QuaternaryButtonProps<TagName>,
  ref?: Ref<ButtonElementType<TagName>>,
): ReactElement {
  const anchorRef = useRef<ButtonElementType<TagName>>(null);
  useImperativeHandle(ref, () => {
    if (!anchorRef.current) {
      throw new Error('QuaternaryButton ref is not attached');
    }

    return anchorRef.current;
  });
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
        className={classNames(
          tag === 'a' && isHovered && 'hover',
          buttonClassName,
        )}
      />
      {children && (
        <label
          htmlFor={id}
          {...labelProps}
          className={classNames(
            // Medium weight to match the button typography guideline (the
            // Button base and CardAction both use font-medium).
            'flex cursor-pointer items-center pl-1 font-medium typo-callout',
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

/**
 * @deprecated Prefer `CardAction` from `./CardAction` for engagement-bar
 * patterns (icon + counter + pressed-state swap on cards / comment rows
 * / post detail). `CardAction` ships an a11y-correct primitive with
 * density (40 px / 32 px), pressed-icon swap, and built-in counter
 * integration. v1 `QuaternaryButton` remains for call sites that haven't
 * migrated yet.
 */
export const QuaternaryButton = forwardRef(QuaternaryButtonComponent);
