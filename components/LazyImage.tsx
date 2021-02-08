import 'lazysizes';
import React, {
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactElement,
  SyntheticEvent,
} from 'react';
import styled from '@emotion/styled';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string;
  imgAlt: string;
  background?: string;
  ratio?: string;
  eager?: boolean;
  fallbackSrc?: string;
}

const Container = styled.div<Props>`
  position: relative;
  overflow: hidden;
  ${(props) => props.background && `background: ${props.background};`}

  ${(props) =>
    props.ratio &&
    `&:before {
    content: '';
    display: block;
    padding-top: ${props.ratio};
  }`}

  img {
    position: absolute;
    display: block;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    margin: auto;
    object-fit: cover;
  }

  img.lazyload:not([src]) {
    visibility: hidden;
  }
`;

const asyncImageSupport = false;

export default function LazyImage(props: Props): ReactElement {
  // const { asyncImageSupport } = useContext(ProgressiveLoadingContext);
  const { imgSrc, imgAlt, eager } = props;
  const imageProps: ImgHTMLAttributes<HTMLImageElement> & {
    'data-src'?: string;
  } = eager
    ? { src: imgSrc }
    : asyncImageSupport
    ? { src: imgSrc, loading: 'lazy' }
    : {
        className: 'lazyload',
        'data-src': imgSrc,
      };

  const onError = (event: SyntheticEvent<HTMLImageElement>): void => {
    if (props.fallbackSrc) {
      event.currentTarget.src = props.fallbackSrc;
    }
  };

  return (
    <Container {...props}>
      <img {...imageProps} alt={imgAlt} key={imgSrc} onError={onError} />
    </Container>
  );
}
