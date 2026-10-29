import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import type { ButtonProps } from './buttons/Button';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import { ArrowIcon, MoveToIcon } from './icons';
import { IconSize } from './Icon';
import { useViewSize, ViewSize } from '../hooks';
import { useSettingsContext } from '../contexts/SettingsContext';
import { useLaptopLayout } from '../hooks/layout/useLaptopLayout';

const baseStyle: CSSProperties = {
  transition: 'transform 0.25s ease-out, opacity 0.25s ease-out',
  willChange: 'transform, opacity',
};

export default function ScrollToTopButton(): ReactElement | null {
  const [show, setShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isTablet = useViewSize(ViewSize.Tablet);
  const { showFeedbackButton } = useSettingsContext();
  const isLaptopLayout = useLaptopLayout();
  const size = (() => {
    if (isLaptop) {
      return ButtonSize.Large;
    }

    return isTablet ? ButtonSize.Medium : ButtonSize.Small;
  })();

  useEffect(() => {
    const callback = () => {
      const shouldShow =
        document.documentElement.scrollTop >= window.innerHeight / 2;
      setShow(shouldShow);
      if (shouldShow) {
        setHasShown(true);
      }
    };
    callback();
    window.addEventListener('scroll', callback, { passive: true });
    return () => window.removeEventListener('scroll', callback);
  }, []);

  if (!hasShown) {
    return null;
  }

  const style: CSSProperties = {
    ...baseStyle,
    transform: show ? undefined : 'translateY(1rem)',
    opacity: show ? undefined : 0,
    pointerEvents: show ? undefined : 'none',
  };

  const onClick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const props: ButtonProps<'button'> = {
    icon: <ArrowIcon />,
    onClick,
  };

  if (isLaptopLayout) {
    // The rail layout wears the phone shell's back-to-top square
    // (ShellTopButton): the floating material, a 38px square with 14px
    // corners and the small rotated arrow, so both layouts share one look.
    // The card floats 0.75rem in from the window and the feedback pill
    // lives in the rail, so the square sits 1rem inside the card's corner:
    // 0.75rem + 1rem from the right, and 1rem above the sponsor strip when
    // one is docked (the card drops its bottom gutter then) or
    // 0.75rem + 1rem from the bottom when not, which is what the
    // property's fallback adds back.
    return (
      <button
        type="button"
        aria-label="scroll to top"
        aria-hidden={!show}
        tabIndex={show ? 0 : -1}
        onClick={onClick}
        className="shell-material shell-press absolute -top-[3.375rem] right-7 z-2 mt-[calc(-1_*_var(--sponsor-strip-height,0.75rem))] flex size-[2.375rem] items-center justify-center rounded-14 text-text-primary"
        style={style}
      >
        <MoveToIcon size={IconSize.XSmall} className="-rotate-90" />
      </button>
    );
  }

  return (
    <Button
      aria-label="scroll to top"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      {...props}
      className={classNames(
        // Lifts over the sponsor strip when one is docked; the property is
        // unset otherwise, so the margin collapses to zero.
        'absolute right-4 z-2 mt-[calc(-1_*_var(--sponsor-strip-height,0px))]',
        showFeedbackButton
          ? '-top-26 tablet:-top-32'
          : '-top-12 tablet:-top-18 laptop:-top-24',
      )}
      variant={ButtonVariant.Primary}
      size={size}
      style={style}
    />
  );
}
