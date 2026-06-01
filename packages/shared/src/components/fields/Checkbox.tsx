import type {
  ChangeEvent,
  ForwardedRef,
  ReactElement,
  ReactNode,
  InputHTMLAttributes,
} from 'react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useId,
} from 'react';
import classNames from 'classnames';
import { VIcon } from '../icons';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  checked?: boolean;
  /**
   * Tri-state "mixed" checkbox (e.g. a parent of partially-selected children).
   * Renders a dash instead of the check and exposes `aria-checked="mixed"`.
   */
  indeterminate?: boolean;
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
    indeterminate = false,
    children,
    className,
    checkmarkClassName,
    onToggleCallback,
    id = '',
    disabled,
    defaultChecked,
    ...props
  }: CheckboxProps,
  ref: ForwardedRef<HTMLInputElement>,
): ReactElement {
  const [actualChecked, setActualChecked] = useState(checked ?? defaultChecked);
  const checkId = useId();
  const inputId = id.concat(checkId);
  const innerRef = useRef<HTMLInputElement | null>(null);

  // Merge the forwarded ref with our own and drive the native `indeterminate`
  // property here (it has no HTML attribute, and setting it from the ref
  // callback applies it at commit time whenever the node attaches or
  // `indeterminate` changes — more reliable than a post-paint effect).
  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (node) {
        // eslint-disable-next-line no-param-reassign
        node.indeterminate = indeterminate;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        // eslint-disable-next-line no-param-reassign
        ref.current = node;
      }
    },
    [ref, indeterminate],
  );

  useEffect(() => {
    setActualChecked(checked ?? defaultChecked);
  }, [checked, defaultChecked]);

  // Keep the native property in sync across re-renders that don't re-attach the
  // ref (e.g. when the checked state changes via user interaction).
  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate, actualChecked]);

  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setActualChecked(event.target.checked);
    onToggleCallback?.(event.target.checked);
  };

  return (
    <label
      className={classNames(
        'relative z-1 inline-flex select-none items-center p-1 pr-3 font-medium text-text-secondary antialiased typo-footnote',
        !disabled && 'cursor-pointer',
        styles.label,
        className,
        { checked: actualChecked, indeterminate, disabled },
      )}
      style={{ transition: 'color 0.1s linear' }}
      htmlFor={inputId}
    >
      <input
        aria-labelledby={`label-span-${checkId}`}
        checked={checked}
        defaultChecked={defaultChecked}
        className="absolute h-0 w-0 opacity-0"
        data-testid="checkbox-input"
        disabled={disabled}
        id={inputId}
        name={name}
        onChange={onChange}
        type="checkbox"
        {...props}
        ref={setRefs}
      />
      <div
        aria-checked={indeterminate ? 'mixed' : actualChecked}
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
          secondary
          className={classNames('icon h-full w-full scale-110 opacity-0')}
          role="presentation"
        />
        <span aria-hidden className={styles.dash} />
      </div>
      <span className="min-w-0 flex-1" id={`label-span-${checkId}`}>
        {children}
      </span>
    </label>
  );
});
