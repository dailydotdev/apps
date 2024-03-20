import React, { CSSProperties, ReactElement, useEffect, useState } from 'react';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from './buttons/Button';
import { ArrowIcon } from './icons';
import { useViewSize, ViewSize } from '../hooks';

const baseStyle: CSSProperties = {
  transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
  willChange: 'transform, opacity',
};

export default function ScrollToTopButton(): ReactElement {
  const [show, setShow] = useState(false);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isTablet = useViewSize(ViewSize.Tablet);
  const size = (() => {
    if (isLaptop) {
      return ButtonSize.XLarge;
    }

    return isTablet ? ButtonSize.Large : ButtonSize.Small;
  })();

  useEffect(() => {
    const callback = () => {
      setShow(document.documentElement.scrollTop >= window.innerHeight / 2);
    };
    window.addEventListener('scroll', callback, { passive: true });
    return () => window.removeEventListener('scroll', callback);
  }, []);

  if (!show) {
    return <></>;
  }

  const props: ButtonProps<'button'> = {
    icon: <ArrowIcon />,
    onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
  };

  const style: CSSProperties = {
    ...baseStyle,
    transform: show ? undefined : 'translateY(1rem)',
    opacity: show ? undefined : 0,
  };

  return (
    <Button
      aria-label="scroll to top"
      {...props}
      className="absolute -top-12 right-4 z-2 tablet:-top-18 laptop:-top-24 laptop:right-8"
      variant={ButtonVariant.Primary}
      size={size}
      style={style}
    />
  );
}
