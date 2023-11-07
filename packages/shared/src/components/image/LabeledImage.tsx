import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';

interface ClassName {
  container?: string;
  content?: string;
  image?: string;
}

interface LabeledImageProps {
  src: string;
  alt: string;
  children?: ReactNode;
  className?: ClassName;
}

const Container = classed('div', 'flex flex-col justify-center items-center');

export function LabeledImage({
  src,
  alt,
  children,
  className = {},
}: LabeledImageProps): ReactElement {
  return (
    <Container className={classNames(className?.container, 'relative')}>
      <img
        className={classNames(
          'w-full bg-cover opacity-64 aspect-square',
          className?.image,
        )}
        src={src}
        alt={alt}
      />
      <div className="flex absolute bottom-0 w-full h-full bg-gradient-to-t to-transparent from-theme-bg-primary from-15%" />
      <Container className={classNames('absolute', className?.content)}>
        {children}
      </Container>
    </Container>
  );
}
