import type { ReactElement } from 'react';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { ArrowIcon } from '../icons';
import { useViewSize, ViewSize } from '../../hooks';

interface PostBottomActionProps {
  onAction: () => void;
}

const THRESHOLD = 120;
const MAX_PULL = 200;
const BOTTOM_TOLERANCE = 24;

export function PostBottomAction({
  onAction,
}: PostBottomActionProps): ReactElement {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [pullDistance, setPullDistance] = useState(0);
  const [atBottom, setAtBottom] = useState(false);
  const [overlayFound, setOverlayFound] = useState(false);

  const pullRef = useRef(0);
  const touchStartY = useRef<number | null>(null);
  const gestureActive = useRef(false);
  const closingRef = useRef(false);
  const overlayRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const findOverlay = useCallback((): HTMLElement | null => {
    if (overlayRef.current && overlayRef.current.isConnected) {
      return overlayRef.current;
    }

    const fromSentinel = sentinelRef.current?.closest(
      '.post-modal-overlay',
    ) as HTMLElement | null;
    if (fromSentinel) {
      overlayRef.current = fromSentinel;
      return fromSentinel;
    }

    const fromDocument = document.querySelector(
      '.post-modal-overlay',
    ) as HTMLElement | null;
    overlayRef.current = fromDocument;
    return fromDocument;
  }, []);

  const isScrolledToBottom = useCallback(
    (overlay: HTMLElement) => {
      return (
        overlay.scrollTop + overlay.clientHeight >=
        overlay.scrollHeight - BOTTOM_TOLERANCE
      );
    },
    [],
  );

  useEffect(() => {
    if (isLaptop) return undefined;

    let retryTimer: ReturnType<typeof setTimeout>;
    let overlay = findOverlay();

    if (!overlay) {
      retryTimer = setTimeout(() => {
        overlay = findOverlay();
        if (overlay) setOverlayFound(true);
      }, 300);
      return () => clearTimeout(retryTimer);
    }

    setOverlayFound(true);

    const onScroll = () => {
      if (!gestureActive.current && overlay) {
        setAtBottom(isScrolledToBottom(overlay));
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!overlay || !isScrolledToBottom(overlay)) {
        touchStartY.current = null;
        gestureActive.current = false;
        return;
      }
      touchStartY.current = e.touches[0].clientY;
      gestureActive.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;

      const dy = touchStartY.current - e.touches[0].clientY;

      if (dy > 8) {
        gestureActive.current = true;
        const damped = Math.min((dy - 8) * 0.55, MAX_PULL);
        pullRef.current = damped;
        setPullDistance(damped);
      } else if (gestureActive.current && dy <= 0) {
        pullRef.current = 0;
        setPullDistance(0);
      }
    };

    const onTouchEnd = () => {
      if (gestureActive.current && pullRef.current >= THRESHOLD) {
        if (!closingRef.current) {
          closingRef.current = true;
          onAction();
          setTimeout(() => {
            closingRef.current = false;
          }, 400);
        }
      }
      touchStartY.current = null;
      gestureActive.current = false;
      pullRef.current = 0;
      setPullDistance(0);
    };

    overlay.addEventListener('scroll', onScroll, { passive: true });
    overlay.addEventListener('touchstart', onTouchStart, { passive: true });
    overlay.addEventListener('touchmove', onTouchMove, { passive: true });
    overlay.addEventListener('touchend', onTouchEnd);
    overlay.addEventListener('touchcancel', onTouchEnd);

    onScroll();

    return () => {
      if (!overlay) return;
      overlay.removeEventListener('scroll', onScroll);
      overlay.removeEventListener('touchstart', onTouchStart);
      overlay.removeEventListener('touchmove', onTouchMove);
      overlay.removeEventListener('touchend', onTouchEnd);
      overlay.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isLaptop, onAction, findOverlay, isScrolledToBottom, overlayFound]);

  useEffect(() => {
    if (pullDistance >= THRESHOLD && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [pullDistance >= THRESHOLD]);

  if (isLaptop) return <span ref={sentinelRef} />;

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const isTriggered = pullDistance >= THRESHOLD;
  const circumference = 2 * Math.PI * 18;
  const dashOffset = circumference - progress * circumference;
  const showPull = pullDistance > 0;
  const showIdle = !showPull && atBottom;

  const indicator = (showPull || showIdle) ? (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[9999] flex justify-center pb-28 tablet:pb-20"
      style={{ willChange: 'transform' }}
    >
      {showPull && (
        <div
          className={classNames(
            'flex h-12 w-12 items-center justify-center rounded-full shadow-2xl backdrop-blur-md',
            isTriggered
              ? 'bg-text-primary text-background-default'
              : 'border border-border-subtlest-tertiary bg-background-default text-text-primary',
          )}
          style={{
            opacity: Math.min(pullDistance / 20, 1),
            transform: `scale(${0.5 + progress * 0.5}) translateY(${-pullDistance * 0.3}px)`,
            transition: 'background-color 150ms, border-color 150ms',
          }}
        >
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              opacity={0.15}
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray={2 * Math.PI * 20}
              strokeDashoffset={
                2 * Math.PI * 20 - progress * (2 * Math.PI * 20)
              }
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 60ms linear' }}
            />
          </svg>
          <ArrowIcon
            className={classNames(
              'h-5 w-5 rotate-180 transition-transform duration-150',
              isTriggered && 'scale-125',
            )}
          />
        </div>
      )}
      {showIdle && (
        <div className="flex flex-col items-center">
          <ArrowIcon className="h-5 w-5 rotate-180 animate-bounce text-text-tertiary" />
          <ArrowIcon className="-mt-2 h-5 w-5 rotate-180 animate-bounce text-text-tertiary [animation-delay:100ms]" />
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      <span ref={sentinelRef} className="invisible block h-0 w-0" />
      {typeof document !== 'undefined' &&
        indicator &&
        createPortal(indicator, document.body)}
    </>
  );
}
