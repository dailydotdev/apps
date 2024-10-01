import React, {
  ChangeEvent,
  forwardRef,
  LegacyRef,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
  InputHTMLAttributes,
  useId,
} from 'react';
import classNames from 'classnames';
import { VIcon } from '../icons';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  checked?: boolean;
  id?: string;
  children?: ReactNode;
  className?: string;
  checkmarkClassName?: string;
  onToggleCallback?: (checked: boolean) => unknown;
}

export const Checkbox = forwardRef(function Checkbox(
  {
    name,
    checked,
    children,
    className,
    checkmarkClassName,
    onToggleCallback,
    id = '',
    disabled,
    ...props
  }: CheckboxProps,
  ref: LegacyRef<HTMLInputElement>,
): ReactElement {
  const [actualChecked, setActualChecked] = useState(checked);
  const checkId = useId();
  const inputId = id.concat(checkId);

  useEffect(() => {
    setActualChecked(checked);
  }, [checked]);

  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setActualChecked(event.target.checked);
    onToggleCallback?.(event.target.checked);
  };

  return (
    <label
      className={classNames(
        'relative z-1 inline-flex select-none items-center p-1 pr-3 text-text-tertiary typo-footnote',
        !disabled && 'cursor-pointer',
        styles.label,
        className,
        { checked: actualChecked, disabled },
      )}
      style={{ transition: 'color 0.1s linear' }}
      htmlFor={inputId}
    >
      <input
        aria-labelledby={`label-span-${checkId}`}
        checked={checked}
        className="absolute h-0 w-0 opacity-0"
        data-testid="checkbox-input"
        disabled={disabled}
        id={inputId}
        name={name}
        onChange={onChange}
        ref={ref}
        type="checkbox"
        {...props}
      />
      <div
        aria-checked={checked}
        aria-labelledby={`label-${checkId}`}
        className={classNames(
          'relative z-1 mr-3 flex h-5 w-5 items-center justify-center rounded-6 border-2 border-border-subtlest-primary',
          styles.checkmark,
          checkmarkClassName,
        )}
        role="checkbox"
      >
        <VIcon
          aria-hidden
          className="icon h-full w-full text-text-primary opacity-0"
          role="presentation"
          style={{ transition: 'opacity 0.1s linear' }}
        />
      </div>
      <span className="min-w-0 flex-1" id={`label-span-${checkId}`}>
        {children}
      </span>
    </label>
  );
});
