import React, {
  ChangeEvent,
  forwardRef,
  LegacyRef,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import classNames from 'classnames';
import VIcon from '../../icons/v.svg';
import styles from '../../styles/checkbox.module.css';

export interface CheckboxProps {
  name: string;
  checked?: boolean;
  children?: ReactNode;
  className?: string;
  onToggle?: (checked: boolean) => unknown;
}

export default forwardRef(function Checkbox(
  { name, checked, children, className, onToggle }: CheckboxProps,
  ref: LegacyRef<HTMLInputElement>,
): ReactElement {
  const [actualChecked, setActualChecked] = useState(checked);

  useEffect(() => {
    setActualChecked(checked);
  }, [checked]);

  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setActualChecked(event.target.checked);
    onToggle?.(event.target.checked);
  };

  return (
    <label
      className={classNames(
        'relative inline-flex items-center text-theme-label-tertiary z-1 cursor-pointer select-none font-bold typo-footnote',
        styles.label,
        className,
        { checked: actualChecked },
      )}
      style={{ transition: 'color 0.1s linear' }}
    >
      <input
        type="checkbox"
        className="absolute w-0 h-0 opacity-0"
        name={name}
        checked={checked}
        onChange={onChange}
        ref={ref}
      />
      <div
        className={classNames(
          'relative flex w-5 h-5 items-center justify-center rounded-md border-2 border-theme-divider-primary mr-3 z-1',
          styles.checkmark,
        )}
      >
        <VIcon
          className="icon w-full h-full text-theme-label-primary opacity-0"
          style={{ transition: 'opacity 0.1s linear' }}
        />
      </div>
      {children}
    </label>
  );
});
