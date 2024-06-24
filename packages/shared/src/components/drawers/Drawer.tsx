import React, {
  HTMLAttributes,
  MutableRefObject,
  ReactElement,
  ReactNode,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import useDebounce from '../../hooks/useDebounce';
import ConditionalWrapper from '../ConditionalWrapper';
import { useOutsideClick } from '../../hooks/utils/useOutsideClick';
import { ButtonVariant } from '../buttons/common';
import { Button } from '../buttons/Button';
import { RootPortal } from '../tooltips/Portal';

export type PopupEventType =
  | MouseEvent
  | KeyboardEvent
  | MessageEvent
  | React.MouseEvent
  | React.KeyboardEvent;

export type PopupCloseFunc = (e: PopupEventType) => void;

export enum DrawerPosition {
  Bottom = 'bottom',
  Top = 'top',
  Left = 'left',
  Right = 'right',
}

interface ClassName {
  overlay?: string;
  drawer?: string;
  close?: string;
  title?: string;
  wrapper?: string;
}

export interface DrawerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title'> {
  children: ReactNode;
  className?: ClassName;
  position?: DrawerPosition;
  closeOnOutsideClick?: boolean;
  isFullScreen?: boolean;
  isClosing?: boolean;
  title?: ReactNode;
  onClose: PopupCloseFunc;
  displayCloseButton?: boolean;
  appendOnRoot?: boolean;
}

export interface DrawerOnMobileProps {
  isDrawerOnMobile?: boolean;
  drawerProps?: Omit<DrawerProps, 'children' | 'onClose'>;
}

const drawerPositionToClassName: Record<DrawerPosition, string> = {
  [DrawerPosition.Bottom]: 'bottom-0 rounded-t-16',
  [DrawerPosition.Top]: 'top-0 rounded-b-16',
  [DrawerPosition.Left]: 'left-0 rounded-r-16',
  [DrawerPosition.Right]: 'right-0 rounded-l-16',
};

const animatePositionClassName: Record<DrawerPosition, string> = {
  [DrawerPosition.Bottom]: 'translate-y-full',
  [DrawerPosition.Top]: '-translate-y-full',
  [DrawerPosition.Left]: '-translate-x-full',
  [DrawerPosition.Right]: 'translate-x-full',
};

function BaseDrawer({
  children,
  className = {},
  position = DrawerPosition.Bottom,
  closeOnOutsideClick = true,
  isFullScreen = false,
  isClosing = false,
  title,
  onClose,
  displayCloseButton,
  ...props
}: DrawerProps): ReactElement {
  const container = useRef<HTMLDivElement>();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [animate] = useDebounce(() => setHasAnimated(true), 1);
  const classes = className?.drawer ?? 'px-4 py-3';
  useOutsideClick(container, onClose, closeOnOutsideClick && hasAnimated);
  const isAnimating = !hasAnimated || isClosing;

  return (
    <div
      className={classNames(
        'fixed inset-0 z-modal transition-opacity duration-300 ease-in-out',
        !isFullScreen && 'bg-overlay-quaternary-onion',
        className?.overlay,
        isAnimating && 'opacity-0',
      )}
    >
      <div
        {...props}
        className={classNames(
          'drawer-padding absolute flex w-full flex-col overflow-y-auto bg-background-default transition-transform duration-300 ease-in-out',
          isFullScreen ? 'inset-0' : 'max-h-[calc(100%-5rem)]',
          !isFullScreen && drawerPositionToClassName[position],
          isAnimating && animatePositionClassName[position],
          !title && 'px-4 pt-3',
          className?.wrapper,
        )}
        ref={(node) => {
          container.current = node;

          if (!node || hasAnimated) {
            return;
          }

          animate();
        }}
      >
        {title && (
          <h3
            className={classNames(
              'flex flex-row items-center border-b border-border-subtlest-tertiary p-4 font-bold typo-title3',
              className?.title,
            )}
          >
            {title}
          </h3>
        )}
        <ConditionalWrapper
          condition={!!title}
          wrapper={(component) => (
            <div className={classNames(classes, 'flex w-full flex-col')}>
              {component}
            </div>
          )}
        >
          {children}
        </ConditionalWrapper>
        {displayCloseButton && (
          <div
            className={classNames(
              'sticky -bottom-3 bg-background-default',
              className?.close,
            )}
          >
            <Button
              variant={ButtonVariant.Float}
              className="mt-3 w-full"
              onClick={(e) => onClose(e.nativeEvent)}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export interface DrawerWrapperProps extends Omit<DrawerProps, 'isClosing'> {
  isOpen: boolean;
}

const ANIMATION_MS = 300;

export interface DrawerRef {
  onClose(): void;
}

function AnimatedDrawer(
  { isOpen, onClose, appendOnRoot, ...props }: DrawerWrapperProps,
  ref: MutableRefObject<DrawerRef>,
): ReactElement {
  const [isClosing, setIsClosing] = useState(false);
  const [debounceClosing] = useDebounce((e: PopupEventType) => {
    setIsClosing(false);
    onClose?.(e);
  }, ANIMATION_MS);

  const onClosing = () => {
    setIsClosing(true);
    debounceClosing();
  };

  useImperativeHandle(ref, () => ({ onClose: onClosing }));

  if (!isOpen) {
    return null;
  }

  return (
    <ConditionalWrapper
      condition={appendOnRoot}
      wrapper={(component) => <RootPortal>{component}</RootPortal>}
    >
      <BaseDrawer {...props} isClosing={isClosing} onClose={onClosing} />
    </ConditionalWrapper>
  );
}

export const Drawer = React.forwardRef(AnimatedDrawer);
