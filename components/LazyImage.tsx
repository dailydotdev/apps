import 'lazysizes/plugins/blur-up/ls.blur-up';
import 'lazysizes';
import React, { ReactElement } from 'react';
import styled from 'styled-components';

export interface Props {
  src: string;
  alt: string;
  lowsrc?: string;
  background?: string;
}

const Container = styled.div<Props>`
  position: relative;
  overflow: hidden;
  ${(props) => props.background && `background: ${props.background};`}

  img {
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  img.ls-blur-up-is-loading,
  img.lazyload:not([src]) {
    visibility: hidden;
  }

  .ls-blur-up-img {
    font-family: 'blur-up: auto', 'object-fit: cover';
  }

  .ls-blur-up-img {
    opacity: 1;
    transition: opacity 150ms;
    will-change: opacity;
  }

  .ls-blur-up-img.ls-inview.ls-original-loaded {
    opacity: 0;
  }
`;

export default function LazyImage(props: Props): ReactElement {
  const { src, alt, lowsrc } = props;
  return (
    <Container {...props}>
      <img
        className="lazyload"
        data-src={src}
        alt={alt}
        data-lowsrc={lowsrc}
        key={src}
      />
    </Container>
  );
}
