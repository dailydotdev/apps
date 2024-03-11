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
          'aspect-square w-full bg-cover object-cover opacity-64',
          className?.image,
        )}
        src={src}
        alt={alt}
      />
      <div className="absolute bottom-0 -mb-px flex h-full w-full bg-gradient-to-t from-background-default from-15% to-transparent" />
      <Container className={classNames('absolute', className?.content)}>
        {children}
      </Container>
    </Container>
  );
}
