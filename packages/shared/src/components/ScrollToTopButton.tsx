import React, { CSSProperties, ReactElement, useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from './buttons/Button';
import { ArrowIcon } from './icons';

const baseStyle: CSSProperties = {
  transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
  willChange: 'transform, opacity',
};

export default function ScrollToTopButton(): ReactElement {
  const [show, setShow] = useState(false);

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
    <>
      <Button
        aria-label="scroll to top"
        {...props}
        className={classNames(
          'absolute -top-18 right-4 z-2 laptop:hidden',
          !show && 'hidden',
        )}
        size={ButtonSize.Large}
        variant={ButtonVariant.Primary}
        style={style}
      />
      <Button
        aria-label="scroll to top"
        {...props}
        className={classNames(
          'absolute -top-24 right-8 z-2 hidden',
          show && 'laptop:flex',
        )}
        variant={ButtonVariant.Primary}
        size={ButtonSize.XLarge}
        style={style}
      />
    </>
  );
}
