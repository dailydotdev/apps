import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { ArrowIcon, VIcon } from '../icons';
import styles from './Dropdown.module.css';
import { usePrevious, useViewSize, ViewSize } from '../../hooks';
import { ListDrawer } from '../drawers/ListDrawer';
import type { SelectParams } from '../drawers/common';
import { RootPortal } from '../tooltips/Portal';
import type { DrawerProps } from '../drawers';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import type { IconProps } from '../Icon';

export interface DropdownClassName {
  container?: string;
  menu?: string;
  label?: string;
  chevron?: string;
  indicator?: string;
  button?: string;
  item?: string;
}

export interface DropdownProps {
  icon?: ReactNode;
  shouldIndicateSelected?: boolean;
  dynamicMenuWidth?: boolean;
  className?: DropdownClassName;
  style?: CSSProperties;
  selectedIndex: number;
  options: string[];
  onChange: (value: string, index: number) => unknown;
  buttonSize?: ButtonSize;
  buttonVariant?: ButtonVariant;
  scrollable?: boolean;
  renderItem?: (value: string, index: number) => ReactNode;
  placeholder?: string;
  iconOnly?: boolean;
  drawerProps?: Omit<DrawerProps, 'children' | 'onClose'>;
  openFullScreen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function Dropdown({
  icon,
  className = {},
  selectedIndex,
  options,
  onChange,
  onOpenChange,
  dynamicMenuWidth,
  shouldIndicateSelected,
  buttonSize = ButtonSize.Large,
  buttonVariant = ButtonVariant.Float,
  scrollable = false,
  renderItem,
  placeholder = '',
  iconOnly,
  drawerProps,
  openFullScreen,
  disabled,
  ...props
}: DropdownProps): ReactElement {
  const id = useId();
  const isMobile = useViewSize(ViewSize.MobileL);
  const [isVisible, setVisibility] = useState(false);
  const wasVisible = usePrevious(`${isVisible}`);
  const triggerRef = useRef<HTMLButtonElement>();

  useEffect(() => {
    onOpenChange?.(isVisible);
  }, [isVisible, onOpenChange]);

  const handleMenuTrigger = (): void => {
    setVisibility(!isVisible);
  };

  const renderButton = () => (
    <Button
      type="button"
      ref={triggerRef}
      variant={buttonVariant}
      size={buttonSize}
      disabled={disabled}
      className={classNames(
        'group flex w-full items-center px-3 font-normal text-text-tertiary typo-body hover:bg-surface-hover hover:text-text-primary',
        className?.button,
        iconOnly && 'items-center justify-center',
      )}
      onClick={fullScreen ? handleMenuTrigger : undefined}
      tabIndex={0}
      aria-haspopup="true"
      aria-expanded={isVisible}
      aria-controls={id}
      icon={
        icon &&
        React.cloneElement(icon as ReactElement<IconProps>, {
          'aria-hidden': true,
          role: 'presentation',
          secondary:
            (icon as ReactElement<IconProps>).props.secondary ?? isVisible,
        })
      }
    >
      {iconOnly ? null : (
        <>
          <span
            className={classNames('mr-1 flex flex-1 truncate', className.label)}
          >
            {selectedIndex >= 0 ? options[selectedIndex] : placeholder}
          </span>
          <ArrowIcon
            className={classNames(
              'ml-auto text-xl transition-transform group-hover:text-text-tertiary',
              isVisible ? 'rotate-0' : 'rotate-180',
              styles.chevron,
              className.chevron,
            )}
          />
        </>
      )}
    </Button>
  );

  const handleChange = ({ value, index }: SelectParams): void => {
    onChange(value, index);
  };

  const fullScreen = openFullScreen ?? isMobile;

  useLayoutEffect(() => {
    if (wasVisible === 'true' && !isVisible) {
      triggerRef?.current?.focus?.();
    }
  }, [isVisible, wasVisible]);

  return (
    <div
      className={classNames(
        styles.dropdown,
        className.container,
        disabled && 'cursor-not-allowed',
      )}
      {...props}
    >
      {fullScreen ? (
        <>
          {renderButton()}
          <RootPortal>
            <ListDrawer
              drawerProps={{
                ...drawerProps,
                isOpen: isVisible,
                onClose: () => setVisibility(false),
                title: drawerProps?.title ? (
                  <>
                    <Button
                      size={ButtonSize.Small}
                      className="mr-2"
                      icon={<ArrowIcon className="-rotate-90" secondary />}
                      onClick={handleMenuTrigger}
                    />
                    {drawerProps.title}
                  </>
                ) : null,
              }}
              options={options}
              customItem={renderItem}
              selected={selectedIndex}
              onSelectedChange={handleChange}
              shouldIndicateSelected={shouldIndicateSelected}
            />
          </RootPortal>
        </>
      ) : (
        <DropdownMenu open={isVisible} onOpenChange={setVisibility}>
          <DropdownMenuTrigger asChild>{renderButton()}</DropdownMenuTrigger>
          <DropdownMenuContent
            className={classNames(className.menu || 'menu-primary', {
              scrollable,
            })}
          >
            {options.map((option, index) => (
              <DropdownMenuItem
                key={option}
                onClick={() =>
                  handleChange({ value: option, index, event: null })
                }
                className={classNames(styles.item, className?.item)}
              >
                <div className="inline-flex flex-1 items-center gap-2">
                  {renderItem ? renderItem(option, index) : option}
                  {shouldIndicateSelected && selectedIndex === index && (
                    <VIcon
                      className={classNames('ml-auto', className.indicator)}
                      secondary
                    />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
