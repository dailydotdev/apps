import type {
  ForwardedRef,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from 'react';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import classNames from 'classnames';
import useDebounceFn from '../../hooks/useDebounceFn';
import ConditionalWrapper from '../ConditionalWrapper';
import { ButtonVariant } from '../buttons/common';
import { Button } from '../buttons/Button';
import { RootPortal } from '../tooltips/Portal';
import { useVisualViewport } from '../../hooks/utils/useVisualViewport';

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
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title'>,
    Pick<ReactModal.Props, 'onAfterOpen' | 'onAfterClose'> {
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
  instantOpen?: boolean;
}

export interface DrawerOnMobileProps {
  isDrawerOnMobile?: boolean;
  drawerProps?: Omit<DrawerProps, 'children' | 'onClose'>;
}

// Drawers can stack; the page unlocks only when the last one leaves.
let scrollLockCount = 0;
let previousHtmlOverflow = '';
let lockedScrollY = 0;

// Escape must close only the top-most drawer of a stack.
const drawerStack: symbol[] = [];

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  onAfterOpen,
  onAfterClose,
  instantOpen = false,
  ...props
}: DrawerProps): ReactElement {
  const container = useRef<HTMLDivElement | null>(null);
  const stackToken = useRef(Symbol('drawer'));
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const { height: viewportHeight, offsetTop } = useVisualViewport(isFullScreen);
  // The native iOS shell draws the webview under the status bar and covers
  // that strip with an opaque `body::before` (safeArea.css), so the overlay
  // must start below `--safe-area-top` — a plain `top: offsetTop` hides the
  // drawer header behind the cover, where it cannot be tapped. Feeding the
  // visual-viewport offset through `--safe-area-top-offset` lets the
  // safeArea.css rules keep both constraints.
  // Height is pinned to 100vh (not the safeArea.css calc, which shrinks by
  // the offset): even mid-pan the opaque cover must reach the keyboard.
  const overlayKeyboardStyle =
    isFullScreen && viewportHeight
      ? ({
          '--safe-area-top-offset': `${offsetTop ?? 0}px`,
          height: '100vh',
        } as React.CSSProperties)
      : undefined;
  // Only the wrapper tracks the visual viewport; the overlay keeps its full
  // layout height so the page never shows through the translucent keyboard.
  // --keyboard-inset lets content cancel the stale safe-area-inset-bottom
  // that WKWebView keeps reporting while the keyboard covers it.
  const wrapperKeyboardStyle =
    isFullScreen && viewportHeight
      ? ({
          '--drawer-viewport-height': `${viewportHeight}px`,
          '--keyboard-inset': `${Math.max(
            0,
            (globalThis.window?.innerHeight ?? 0) - viewportHeight,
          )}px`,
        } as React.CSSProperties)
      : undefined;
  const [hasAnimated, setHasAnimated] = useState(instantOpen);
  const [animate] = useDebounceFn(() => setHasAnimated(true), 1);
  const classes = className?.drawer ?? 'px-4 py-3';
  const isAnimating = !hasAnimated || isClosing;

  useEffect(() => {
    onAfterOpen?.();
    return () => {
      onAfterClose?.();
    };
  }, [onAfterClose, onAfterOpen]);

  useEffect(() => {
    const token = stackToken.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    drawerStack.push(token);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || drawerStack[drawerStack.length - 1] !== token) {
        return;
      }
      e.stopPropagation();
      onCloseRef.current(e);
    };
    document.addEventListener('keydown', onKeyDown);

    if (!container.current?.contains(document.activeElement)) {
      container.current?.focus();
    }

    return () => {
      drawerStack.splice(drawerStack.indexOf(token), 1);
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, []);

  useEffect(() => {
    if (!isFullScreen) {
      return undefined;
    }

    // <html> is the page's actual scroller — body-level `overflow: hidden`
    // alone never reaches the viewport.
    if (scrollLockCount === 0) {
      previousHtmlOverflow = document.documentElement.style.overflow;
      // WebKit's keyboard reveal scroll ignores `overflow: hidden`; pinning
      // the body removes the scrollable range so the page cannot move at all.
      lockedScrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
    }
    scrollLockCount += 1;
    document.body.classList.add('hidden-scrollbar');
    document.documentElement.style.overflow = 'hidden';

    return () => {
      scrollLockCount -= 1;
      if (scrollLockCount > 0) {
        return;
      }
      document.body.classList.remove('hidden-scrollbar');
      document.body.style.removeProperty('position');
      document.body.style.removeProperty('top');
      document.body.style.removeProperty('left');
      document.body.style.removeProperty('right');
      if (previousHtmlOverflow) {
        document.documentElement.style.overflow = previousHtmlOverflow;
      } else {
        document.documentElement.style.removeProperty('overflow');
      }
      if (lockedScrollY) {
        window.scrollTo(0, lockedScrollY);
      }
    };
  }, [isFullScreen]);

  // iOS pans the webview to reveal the focused input when the keyboard
  // opens — a native scroll the body pin cannot stop (WKWebView extends the
  // scroll range by the keyboard inset). Undoing it keeps the drawer's
  // geometry static; the wrapper already keeps the caret above the keyboard.
  useEffect(() => {
    if (!isFullScreen) {
      return undefined;
    }

    const undoPan = () => {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };
    // Touch pans reach the native scroller even from unscrollable content;
    // block them unless an inner scroller (textarea, drawer body) owns them.
    const onTouchMove = (e: TouchEvent) => {
      let el = e.target as HTMLElement | null;
      while (el && el !== e.currentTarget) {
        if (el.scrollHeight > el.clientHeight) {
          const { overflowY } = getComputedStyle(el);
          if (overflowY === 'auto' || overflowY === 'scroll') {
            return;
          }
        }
        el = el.parentElement;
      }
      e.preventDefault();
    };

    const overlay = container.current?.parentElement;
    window.addEventListener('scroll', undoPan);
    window.visualViewport?.addEventListener('scroll', undoPan);
    window.visualViewport?.addEventListener('resize', undoPan);
    overlay?.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      window.removeEventListener('scroll', undoPan);
      window.visualViewport?.removeEventListener('scroll', undoPan);
      window.visualViewport?.removeEventListener('resize', undoPan);
      overlay?.removeEventListener('touchmove', onTouchMove);
    };
  }, [isFullScreen]);

  const trapFocus = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !container.current) {
      return;
    }
    const focusable = Array.from(
      container.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    if (!focusable.length) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === container.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Not a `contains` check: portaled children (dropdowns, popovers) live
    // under document.body, yet React bubbles their clicks to this handler.
    if (closeOnOutsideClick && hasAnimated && e.target === e.currentTarget) {
      onClose(e.nativeEvent);
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className={classNames(
        'fixed z-modal transition-opacity duration-300 ease-in-out',
        isFullScreen
          ? 'inset-x-0 top-0 h-full bg-background-default'
          : 'inset-0 bg-overlay-quaternary-onion',
        className?.overlay,
        isAnimating && 'opacity-0',
      )}
      style={overlayKeyboardStyle}
      onClick={handleOverlayClick}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        {...props}
        role="dialog"
        aria-modal="true"
        aria-label={
          props['aria-label'] ?? (typeof title === 'string' ? title : undefined)
        }
        tabIndex={-1}
        onKeyDown={trapFocus}
        // iOS never shrinks the layout viewport for the keyboard, so the
        // wrapper is sized to the visual viewport to keep the bottom actions
        // above it. The height wins over `inset-0`'s bottom edge; without the
        // inline variable the calc is invalid and `inset-0` takes over.
        style={wrapperKeyboardStyle}
        className={classNames(
          'drawer-padding absolute flex w-full flex-col overflow-y-auto overscroll-contain bg-background-default transition-transform duration-300 ease-in-out',
          isFullScreen
            ? 'inset-0 h-[calc(var(--drawer-viewport-height)_-_var(--safe-area-top,0px))]'
            : 'max-h-[calc(100%-5rem)]',
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
              onClick={(e: React.MouseEvent) => onClose(e.nativeEvent)}
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
  ref: ForwardedRef<DrawerRef>,
): ReactElement | null {
  const [isClosing, setIsClosing] = useState(false);
  const [debounceClosing] = useDebounceFn<PopupEventType>((e) => {
    setIsClosing(false);
    // `onClosing`, the only caller, always forwards the event.
    onClose?.(e as PopupEventType);
  }, ANIMATION_MS);

  const onClosing = (e?: PopupEventType) => {
    setIsClosing(true);
    debounceClosing(e);
  };

  useImperativeHandle(ref, () => ({ onClose: onClosing }));

  if (!isOpen) {
    return null;
  }

  return (
    <ConditionalWrapper
      condition={appendOnRoot ?? false}
      wrapper={(component) => <RootPortal>{component}</RootPortal>}
    >
      <BaseDrawer {...props} isClosing={isClosing} onClose={onClosing} />
    </ConditionalWrapper>
  );
}

export const Drawer = React.forwardRef(AnimatedDrawer);
