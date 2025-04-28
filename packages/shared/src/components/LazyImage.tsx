import type {
  ComponentPropsWithoutRef,
  ReactElement,
  ReactNode,
  Ref,
  SyntheticEvent,
} from 'react';
import React, { forwardRef } from 'react';
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
    fetchPriority = 'auto',
    ...props
  }: LazyImageProps,
  ref?: Ref<HTMLImageElement>,
): ReactElement {
  const src = imgSrc || fallbackSrc;
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
      style={{ background, ...props?.style }}
      ref={ref}
    >
      {ratio && <div style={{ paddingTop: ratio, zIndex: -1 }} />}
      <img
        alt={imgAlt}
        className={classNames(
          'absolute inset-0 m-auto block h-full w-full',
          fit === 'cover' ? 'object-cover' : 'object-contain',
        )}
        key={src}
        loading={eager ? 'eager' : 'lazy'}
        src={src}
        onError={onError}
        /* @ts-expect-error - Not supported by react yet */ /* eslint-disable react/no-unknown-property */
        fetchpriority={fetchPriority}
      />
      {children}
    </figure>
  );
}


export type LazyVideoProps = Omit<LazyImageProps, 'imgSrc' | 'imgAlt' | 'fallbackSrc' | 'fetchPriority'> & {
  poster?: string;
  videoSrc: string;
}

 const LazyVideoComponent = (
  {
    videoSrc,
    poster,
    eager,
    className,
    ratio,
    background,
    children,
    absolute = false,
    fit = 'cover',
    ...props
  }: LazyVideoProps,
  ref?: Ref<HTMLImageElement>,
): ReactElement => {
  const src = videoSrc;

  return (
    <figure
      {...props}
      className={classNames(
        className,
        absolute ? 'absolute' : 'relative',
        'overflow-hidden',
      )}
      style={{ background, ...props?.style }}
      ref={ref as any} // because figure doesn't have a video ref, we cast
    >
      {ratio && <div style={{ paddingTop: ratio, zIndex: -1 }} />}
      <video
        className={classNames(
          'absolute inset-0 m-auto block h-full w-full',
          fit === 'cover' ? 'object-cover' : 'object-contain',
        )}
        key={src}
        preload={eager ? 'auto' : 'metadata'}
        poster={poster}
        src={src}
        muted
        autoPlay
        loop
        playsInline
        disablePictureInPicture
        controls={false}
      />
      {children}
    </figure>
  );
}

export const LazyVideo = forwardRef(LazyVideoComponent);

export const LazyImage = forwardRef(LazyImageComponent);
