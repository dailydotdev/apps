import React, { CSSProperties, ReactElement, useEffect, useState } from 'react';
import { Button, ButtonProps } from './buttons/Button';
import ArrowIcon from './icons/Arrow';

const baseStyle: CSSProperties = {
  position: 'fixed',
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
        className="laptop:hidden right-4 z-2 btn-primary"
        buttonSize="large"
        style={{ ...style, bottom: '4.5rem' }}
      />
      <Button
        aria-label="scroll to top"
        {...props}
        className="hidden laptop:flex right-8 bottom-8 z-2 btn-primary"
        buttonSize="xlarge"
        style={style}
      />
    </>
  );
}
