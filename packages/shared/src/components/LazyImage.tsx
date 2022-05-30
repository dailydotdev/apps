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

const asyncImageSupport = false;

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
  // const { asyncImageSupport } = useContext(ProgressiveEnhancementContext);
  const baseImageClass = `absolute block inset-0 w-full h-full m-auto ${
    fit === 'cover' ? 'object-cover' : 'object-contain'
  }`;
  let imageProps: ImgHTMLAttributes<HTMLImageElement> & {
    'data-src'?: string;
  };
  if (eager) {
    imageProps = { src: imgSrc, className: baseImageClass };
  } else if (asyncImageSupport) {
    imageProps = { src: imgSrc, loading: 'lazy', className: baseImageClass };
  } else {
    imageProps = {
      className: `lazyload ${baseImageClass}`,
      'data-src': imgSrc,
    };
  }

  const onError = (event: SyntheticEvent<HTMLImageElement>): void => {
    if (fallbackSrc) {
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
      <img {...imageProps} alt={imgAlt} key={imgSrc} onError={onError} />
      {children}
    </div>
  );
}

export const LazyImage = forwardRef(LazyImageComponent);
