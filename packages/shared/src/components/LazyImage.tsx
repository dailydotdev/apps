import React, {
  ComponentPropsWithoutRef,
  forwardRef,
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
      style={{ background, ...props.style }}
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
        // @ts-expect-error - Not supported by react yet
        fetchpriority={fetchPriority}
      />
      {children}
    </figure>
  );
}

export const LazyImage = forwardRef(LazyImageComponent);
