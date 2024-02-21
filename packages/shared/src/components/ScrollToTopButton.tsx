import React, { CSSProperties, ReactElement, useEffect, useState } from 'react';
import classNames from 'classnames';
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

  useEffect(() => {
    const callback = () => {
      setShow(document.documentElement.scrollTop >= window.innerHeight / 2);
    };
    window.addEventListener('scroll', callback, { passive: true });
    return () => window.removeEventListener('scroll', callback);
  }, []);

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
      className={classNames(
        'absolute -top-18 right-4 z-2 laptop:-top-24 laptop:right-8',
        !show && 'hidden',
        show && isLaptop && 'laptop:flex',
      )}
      variant={ButtonVariant.Primary}
      size={isLaptop ? ButtonSize.XLarge : ButtonSize.Large}
      style={style}
    />
  );
}
