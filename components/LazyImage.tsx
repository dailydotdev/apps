import 'lazysizes';
import React, {
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactElement,
  ReactNode,
  SyntheticEvent,
} from 'react';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string;
  imgAlt: string;
  background?: string;
  ratio?: string;
  eager?: boolean;
  fallbackSrc?: string;
  children?: ReactNode;
}

const asyncImageSupport = false;

const baseImageClass = `absolute block inset-0 w-full h-full m-auto object-cover`;

export default function LazyImage({
  imgSrc,
  imgAlt,
  eager,
  className,
  ratio,
  background,
  fallbackSrc,
  children,
  ...props
}: Props): ReactElement {
  // const { asyncImageSupport } = useContext(ProgressiveEnhancementContext);
  const imageProps: ImgHTMLAttributes<HTMLImageElement> & {
    'data-src'?: string;
  } = eager
    ? { src: imgSrc, className: baseImageClass }
    : asyncImageSupport
    ? { src: imgSrc, loading: 'lazy', className: baseImageClass }
    : {
        className: `lazyload ${baseImageClass}`,
        'data-src': imgSrc,
      };

  const onError = (event: SyntheticEvent<HTMLImageElement>): void => {
    if (fallbackSrc) {
      event.currentTarget.src = fallbackSrc;
    }
  };

  return (
    <div
      {...props}
      className={`${className} relative overflow-hidden`}
      style={{ background }}
    >
      {ratio && <div style={{ paddingTop: ratio, zIndex: -1 }} />}
      <img {...imageProps} alt={imgAlt} key={imgSrc} onError={onError} />
      {children}
    </div>
  );
}
