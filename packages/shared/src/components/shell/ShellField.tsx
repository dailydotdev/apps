import type { FormEvent, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { ClearIcon, SearchIcon } from '../icons';
import { IconSize } from '../Icon';
import { useIsPhone } from '../../hooks/useViewSize';
import { useMobileAppFooterContext } from '../../features/getApp/contexts/MobileAppFooterContext';
import { useVisualViewport } from '../../hooks/utils/useVisualViewport';
import { cluster, field, lerp, motion } from './constants';
import { setShellFieldFocused, useRegisterShellField } from './shellFieldStore';
import { revealShell, useShellScroll } from './useShellScroll';
import { hidesCluster } from './shellNav';
import { RootPortal } from '../tooltips/Portal';
import { useShellFieldPlacement } from './shellFieldPlacement';
import { ShellActions } from './ShellPageContext';
import { ShellSquare } from './ShellSquare';

interface ShellFieldProps {
  placeholder: string;
  // A field that opens something else (Spotlight) is a button in the
  // field's clothes; one that filters its own list is an input.
  onOpen?: () => void;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onFocus?: () => void;
  // In a browser the field opens at the top of the page on the 16px gutter;
  // a host that already pads its content pulls it out with -mx-4.
  className?: string;
}

const transition = ['transform', 'height', 'border-radius', 'padding']
  .map((property) => `${property} ${motion.snap}ms ${motion.interaction}`)
  .join(', ');

export function ShellField({
  placeholder,
  onOpen,
  value = '',
  onChange,
  onSubmit,
  onFocus,
  className,
}: ShellFieldProps): ReactElement | null {
  const isPhone = useIsPhone();
  const placement = useShellFieldPlacement();
  const atBottom = placement === 'bottom';
  const router = useRouter();
  // Settings and forms have no bar; the field rests in the bar's place.
  const hasBar = !hidesCluster(router?.pathname ?? '', router?.asPath);
  const { p } = useShellScroll();
  const [isFocused, setIsFocused] = useState(false);
  // Browser only: the field shows once its square in the block is tapped and
  // stays while it holds a query.
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const viewport = useVisualViewport(isFocused);
  // The app footer owns the bottom while it is up.
  const { title: appFooterTitle } = useMobileAppFooterContext();
  const hasAppFooter = !!appFooterTitle;
  const isShown = isPhone && !hasAppFooter;
  useRegisterShellField(isShown && atBottom);

  useEffect(() => {
    setShellFieldFocused(isFocused);
    return () => setShellFieldFocused(false);
  }, [isFocused]);

  if (!isShown) {
    return null;
  }

  // iOS lays the keyboard over the page instead of resizing it, so the
  // visual viewport is the only place that knows how tall the keyboard is.
  const keyboard = isFocused
    ? Math.max(
        0,
        window.innerHeight - (viewport.height ?? 0) - (viewport.offsetTop ?? 0),
      )
    : 0;
  const progress = isFocused || !atBottom ? 0 : p;
  const restBottom = `calc(${cluster.floor} + ${
    hasBar ? cluster.rest + field.gap : 0
  }px)`;
  const focusedBottom =
    keyboard > 0
      ? `${keyboard + field.gap}px`
      : `calc(env(safe-area-inset-bottom, 0px) + ${field.gap}px)`;
  const surfaceStyle = {
    height: lerp(field.rest, field.compact, progress),
    borderRadius: lerp(field.radiusRest, field.radiusCompact, progress),
    transition: atBottom ? transition : undefined,
  };
  const surfaceClassName = classNames(
    'pointer-events-auto flex w-full items-center gap-2 px-3 text-left motion-reduce:!transition-none',
    isFocused
      ? 'border border-text-primary bg-background-default'
      : 'shell-material shell-material-action',
  );
  const icon = (
    <SearchIcon size={IconSize.Small} className="shrink-0 text-text-tertiary" />
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit?.(value);
    inputRef.current?.blur();
  };

  const surface = onOpen ? (
    <button
      type="button"
      aria-label={placeholder}
      onClick={onOpen}
      className={classNames(surfaceClassName, 'shell-press')}
      style={surfaceStyle}
    >
      {icon}
      <span
        className={classNames(
          'min-w-0 flex-1 truncate typo-body',
          value ? 'text-text-primary' : 'text-text-tertiary',
        )}
      >
        {value || placeholder}
      </span>
    </button>
  ) : (
    <form
      role="search"
      onSubmit={submit}
      className={surfaceClassName}
      style={surfaceStyle}
    >
      {icon}
      <input
        ref={inputRef}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        onFocus={() => {
          setIsFocused(true);
          if (atBottom) {
            revealShell();
          }
          onFocus?.();
        }}
        onBlur={() => {
          setIsFocused(false);
          if (!value) {
            setIsOpen(false);
          }
        }}
        className="min-w-0 flex-1 bg-transparent text-text-primary outline-none typo-body placeholder:text-text-tertiary [&::-webkit-search-cancel-button]:hidden"
      />
      {!!value && (
        <button
          type="button"
          aria-label="Clear search"
          // Keeps the input focused, so the keyboard stays up.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onChange?.('')}
          className="shell-hit relative flex size-6 shrink-0 items-center justify-center text-text-tertiary"
        >
          <ClearIcon size={IconSize.Small} />
        </button>
      )}
    </form>
  );

  if (!atBottom) {
    const square = (
      <ShellActions>
        <ShellSquare
          aria-label={placeholder}
          aria-expanded={onOpen ? undefined : isOpen}
          onClick={() => {
            if (onOpen) {
              onOpen();
              return;
            }
            setIsOpen(true);
            // Focused inside the tap, the way iOS wants it before it raises
            // the keyboard; the field is only hidden from view until then.
            inputRef.current?.focus();
          }}
        >
          <SearchIcon size={IconSize.Medium} />
        </ShellSquare>
      </ShellActions>
    );
    if (onOpen) {
      return square;
    }
    const isVisible = isOpen || !!value;

    return (
      <>
        {square}
        <div
          className={classNames(
            'px-4 tablet:hidden',
            !isVisible && 'sr-only',
            className,
          )}
        >
          {surface}
        </div>
      </>
    );
  }

  return (
    <RootPortal>
      <div
        className="shell-field pointer-events-none fixed inset-x-0 z-3 motion-reduce:!transition-none tablet:hidden"
        style={{
          bottom: isFocused ? focusedBottom : restBottom,
          paddingInline: isFocused
            ? field.focusedInset
            : lerp(cluster.inset, cluster.insetCompact, progress),
          transform: hasBar
            ? `translateY(${progress * (cluster.rest + field.gap)}px)`
            : undefined,
          transition,
        }}
      >
        {surface}
      </div>
    </RootPortal>
  );
}
