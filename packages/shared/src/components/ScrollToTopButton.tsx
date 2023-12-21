import React, { CSSProperties, ReactElement, useEffect, useState } from 'react';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from './buttons/ButtonV2';
import ArrowIcon from './icons/Arrow';

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
        className="laptop:hidden fixed right-4 bottom-18 z-2"
        size={ButtonSize.Large}
        variant={ButtonVariant.Primary}
        style={style}
      />
      <Button
        aria-label="scroll to top"
        {...props}
        className="hidden laptop:flex fixed right-8 bottom-8 z-2"
        variant={ButtonVariant.Primary}
        size={ButtonSize.XLarge}
        style={style}
      />
    </>
  );
}
