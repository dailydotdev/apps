import React, {
  ComponentPropsWithoutRef,
  forwardRef,
  ImgHTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
  SyntheticEvent,
} from 'react';
import classNames from 'classnames';

export interface LazyImageProps extends ComponentPropsWithoutRef<'img'> {
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
  width?: number;
  height?: number;
}

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
  } else {
    imageProps = { src, loading: 'lazy', className: baseImageClass };
  }

  const onError = (event: SyntheticEvent<HTMLImageElement>): void => {
    if (fallbackSrc && fallbackSrc !== event.currentTarget.src) {
      // eslint-disable-next-line no-param-reassign
      event.currentTarget.src = fallbackSrc;
    }
  };

  return (
    <figure
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
    </figure>
  );
}

export const LazyImage = forwardRef(LazyImageComponent);
