import React, { CSSProperties, ReactElement, useEffect, useState } from 'react';
import { Button, ButtonProps, ButtonSize } from './buttons/Button';
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
        className="btn-primary right-4 z-2 laptop:hidden"
        buttonSize={ButtonSize.Large}
        style={{ ...style, bottom: '4.5rem' }}
      />
      <Button
        aria-label="scroll to top"
        {...props}
        className="btn-primary bottom-8 right-8 z-2 hidden laptop:flex"
        buttonSize={ButtonSize.XLarge}
        style={style}
      />
    </>
  );
}
