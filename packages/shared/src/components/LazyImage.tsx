import React, {
  forwardRef,
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
  SyntheticEvent,
} from 'react';
import classNames from 'classnames';

export interface LazyImageProps extends HTMLAttributes<HTMLImageElement> {
  imgSrc: string;
  imgAlt: string;
  background?: string;
  ratio?: string;
  eager?: boolean;
  fallbackSrc?: string;
  children?: ReactNode;
  absolute?: boolean;
  fit?: 'cover' | 'contain';
  ref?: Ref<HTMLImageElement>;
}

const asyncImageSupport = true;

function LazyImageComponent(
  {
    imgSrc,
    imgAlt,
    eager,
    className,
    ratio,
    background,
    fallbackSrc,
    children,
    absolute = false,
    fit = 'cover',
    ...props
  }: LazyImageProps,
  ref?: Ref<HTMLImageElement>,
): ReactElement {
  const src = imgSrc || fallbackSrc;

  const baseImageClass = `absolute block inset-0 w-full h-full m-auto ${
    fit === 'cover' ? 'object-cover' : 'object-contain'
  }`;
  let imageProps: ImgHTMLAttributes<HTMLImageElement> & {
    'data-src'?: string;
  };
  if (eager) {
    imageProps = { src, className: baseImageClass };
  } else if (asyncImageSupport) {
    imageProps = { src, loading: 'lazy', className: baseImageClass };
  } else {
    imageProps = {
      className: `lazyload ${baseImageClass}`,
      'data-src': src,
    };
  }

  const onError = (event: SyntheticEvent<HTMLImageElement>): void => {
    if (fallbackSrc && fallbackSrc !== event.currentTarget.src) {
      // eslint-disable-next-line no-param-reassign
      event.currentTarget.src = fallbackSrc;
    }
  };

  return (
    <div
      {...props}
      className={classNames(
        className,
        absolute ? 'absolute' : 'relative',
        'overflow-hidden',
      )}
      style={{ background, ...props.style }}
      ref={ref}
    >
      {ratio && <div style={{ paddingTop: ratio, zIndex: -1 }} />}
      <img {...imageProps} alt={imgAlt} key={src} onError={onError} />
      {children}
    </div>
  );
}

export const LazyImage = forwardRef(LazyImageComponent);
