import type {
  ForwardedRef,
  InputHTMLAttributes,
  PointerEvent as ReactPointerEvent,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
} from 'react';
import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './Switch.module.css';

// Knob slides this many px between the off and on positions (matches the CSS).
const KNOB_TRAVEL = 20;
// Knob center when translateX is 0 (2px track inset + 10px half knob width).
const KNOB_CENTER_OFFSET = 12;
// How far the pointer must move before a hold turns into a drag.
const DRAG_THRESHOLD = 3;

interface DragState {
  pointerId: number;
  startX: number;
  startChecked: boolean;
  moved: boolean;
  lastPos: number;
}

export interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  children?: ReactNode;
  className?: string;
  labelClassName?: string;
  inputId: string;
  name: string;
  checked?: boolean;
  onToggle?: () => unknown;
  compact?: boolean;
  defaultTypo?: boolean;
}

function SwitchComponent(
  {
    className,
    labelClassName,
    inputId,
    name,
    checked,
    children,
    onToggle,
    compact = true,
    defaultTypo = true,
    disabled,
    'aria-label': ariaLabel,
    ...props
  }: SwitchProps,
  ref: ForwardedRef<HTMLLabelElement>,
): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const dragRef = useRef<DragState | null>(null);
  // A drag ends with a synthetic click we must swallow so it doesn't re-toggle.
  const suppressClickRef = useRef(false);
  const [dragX, setDragX] = useState<number | null>(null);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLSpanElement>) => {
      if (disabled || event.button !== 0) {
        return;
      }
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startChecked: !!checked,
        moved: false,
        lastPos: checked ? KNOB_TRAVEL : 0,
      };
      trackRef.current?.setPointerCapture(event.pointerId);
    },
    [disabled, checked],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLSpanElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }
      if (
        !drag.moved &&
        Math.abs(event.clientX - drag.startX) < DRAG_THRESHOLD
      ) {
        return;
      }
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      drag.moved = true;
      const pos = Math.min(
        KNOB_TRAVEL,
        Math.max(0, event.clientX - rect.left - KNOB_CENTER_OFFSET),
      );
      drag.lastPos = pos;
      setDragX(pos);
    },
    [],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLSpanElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }
      dragRef.current = null;
      if (trackRef.current?.hasPointerCapture(event.pointerId)) {
        trackRef.current.releasePointerCapture(event.pointerId);
      }
      if (drag.moved) {
        const target = drag.lastPos >= KNOB_TRAVEL / 2;
        // Swallow the click that fires after a drag so we toggle only once.
        suppressClickRef.current = true;
        if (target !== !!checked) {
          if (inputRef.current) {
            inputRef.current.checked = target;
          }
          onToggle?.();
        }
      }
      // Drop the inline transform so the knob snaps to its side with the CSS transition.
      setDragX(null);
    },
    [checked, onToggle],
  );

  const handlePointerCancel = useCallback(() => {
    if (!dragRef.current) {
      return;
    }
    dragRef.current = null;
    setDragX(null);
  }, []);

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLLabelElement>) => {
      if (suppressClickRef.current) {
        event.preventDefault();
        suppressClickRef.current = false;
      }
    },
    [],
  );

  const knobStyle =
    dragX !== null
      ? { transform: `translateX(${dragX}px) scale(0.6)`, transition: 'none' }
      : undefined;

  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control, jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <label
      className={classNames(
        className,
        'group relative flex items-center',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        styles.switch,
        disabled && styles.disabled,
      )}
      ref={ref}
      onClick={handleClick}
    >
      <input
        {...props}
        ref={inputRef}
        disabled={disabled}
        id={inputId}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="absolute h-0 w-0 opacity-0"
      />
      <span
        ref={trackRef}
        className="relative block h-6 w-11 touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={handlePointerCancel}
      >
        <span
          className={classNames('absolute inset-0 rounded-8', styles.track)}
        />
        <span
          className={classNames(
            'absolute inset-0.5 rounded-6',
            styles.hoverLayer,
          )}
        />
        <span
          className={classNames(
            'pointer-events-none absolute inset-0 rounded-8 border-2 border-solid',
            styles.focusRing,
          )}
        />
        <span
          style={knobStyle}
          className={classNames(
            'absolute left-0.5 top-0.5 h-5 w-5 rounded-6',
            styles.knob,
          )}
        />
      </span>
      {children ? (
        <span
          className={classNames(
            'ml-3 font-medium antialiased',
            defaultTypo && (compact ? 'typo-footnote' : 'typo-callout'),
            styles.children,
            labelClassName,
          )}
        >
          {children}
        </span>
      ) : (
        ariaLabel && <span className="sr-only">{ariaLabel}</span>
      )}
    </label>
  );
}

export const Switch = React.forwardRef(SwitchComponent);
