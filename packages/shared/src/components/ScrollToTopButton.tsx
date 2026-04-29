import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import type { ButtonProps } from './buttons/Button';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import { ArrowIcon } from './icons';
import { useViewSize, ViewSize } from '../hooks';
import { useSettingsContext } from '../contexts/SettingsContext';

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

  const props: ButtonProps<'button'> = {
    icon: <ArrowIcon />,
    onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
  };

  const style: CSSProperties = {
    ...baseStyle,
    transform: show ? undefined : 'translateY(1rem)',
    opacity: show ? undefined : 0,
    pointerEvents: show ? undefined : 'none',
  };

  return (
    <Button
      aria-label="scroll to top"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      {...props}
      className={classNames(
        'absolute right-4 z-2',
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
