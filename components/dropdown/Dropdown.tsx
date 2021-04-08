import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import ArrowIcon from '../../icons/arrow.svg';
import styles from '../../styles/dropdown.module.css';
import {
  Item,
  ItemParams,
  Menu,
  TriggerEvent,
  useContextMenu,
} from 'react-contexify';

export interface DropdownProps {
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
  selectedIndex: number;
  options: string[];
  onChange: (value: string, index: number) => unknown;
  compact?: boolean;
}

export default function Dropdown({
  icon,
  className,
  selectedIndex,
  options,
  onChange,
  compact,
  ...props
}: DropdownProps): ReactElement {
  const id = 'my-custom-id';
  const [isVisible, setVisibility] = useState(false);
  const [menuWidth, setMenuWidth] = useState<number>();
  const triggerRef = useRef<HTMLButtonElement>();
  const { show, hideAll } = useContextMenu({ id });

  const showMenu = (event: TriggerEvent): void => {
    const { left, bottom, width } = triggerRef.current.getBoundingClientRect();
    setMenuWidth(width);
    setVisibility(true);
    show(event, {
      position: { x: left, y: bottom + 8 },
    });
  };

  const handleMenuTrigger = (event: React.MouseEvent): void => {
    if (isVisible) {
      setVisibility(false);
      hideAll();
      return;
    }
    showMenu(event);
  };

  const handleKeyboard = (event: React.KeyboardEvent): void => {
    switch (event.key) {
      case 'Enter':
        showMenu(event);
        break;
      case 'Escape':
        if (isVisible) {
          setVisibility(false);
          hideAll();
        }
        break;
      default:
        break;
    }
  };

  const handleChange = ({
    data,
  }: ItemParams<unknown, { value: string; index: number }>): void => {
    onChange(data.value, data.index);
  };

  return (
    <div className={classNames(styles.dropdown, className)} {...props}>
      <button
        ref={triggerRef}
        className={classNames(
          'group flex w-full px-3 items-center bg-theme-float rounded-xl typo-body text-theme-label-tertiary hover:text-theme-label-primary hover:bg-theme-hover',
          compact ? 'h-10' : 'h-12',
        )}
        onClick={handleMenuTrigger}
        onKeyDown={handleKeyboard}
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isVisible}
      >
        {icon}
        {options[selectedIndex]}
        <ArrowIcon
          className={classNames(
            'text-xl ml-auto transform rotate-180 transition-transform group-hover:text-theme-label-tertiary',
            styles.chevron,
          )}
        />
      </button>
      <Menu
        id={id}
        className="menu-primary"
        animation="fade"
        onHidden={() => setVisibility(false)}
        style={{ width: menuWidth }}
      >
        {options.map((option, index) => (
          <Item
            key={option}
            onClick={handleChange}
            data={{ value: option, index }}
          >
            {option}
          </Item>
        ))}
      </Menu>
    </div>
  );
}
