import 'lazysizes/plugins/blur-up/ls.blur-up';
import 'lazysizes';
import React, { HTMLAttributes, ReactElement, SyntheticEvent } from 'react';
import styled from 'styled-components/macro';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string;
  imgAlt: string;
  lowsrc?: string;
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

  img.ls-blur-up-is-loading,
  img.lazyload:not([src]) {
    visibility: hidden;
  }

  .ls-blur-up-img {
    opacity: 1;
    transition: opacity 150ms;
    will-change: opacity;
    /* stylelint-disable-next-line font-family-no-missing-generic-family-keyword */
    font-family: 'blur-up: auto', 'object-fit: cover';
  }

  .ls-blur-up-img.ls-inview.ls-original-loaded {
    opacity: 0;
  }
`;

export default function LazyImage(props: Props): ReactElement {
  const { imgSrc, imgAlt, eager, lowsrc } = props;
  const imageProps = eager
    ? { src: imgSrc }
    : {
        className: 'lazyload',
        'data-src': imgSrc,
        'data-lowsrc': lowsrc,
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
