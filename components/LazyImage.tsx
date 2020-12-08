import 'lazysizes';
import React, { HTMLAttributes, ReactElement } from 'react';
import styled from 'styled-components';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string;
  imgAlt: string;
  background?: string;
  ratio?: string;
  eager?: boolean;
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

export default function LazyImage(props: Props): ReactElement {
  const { imgSrc, imgAlt, eager } = props;
  const imageProps = eager
    ? { src: imgSrc }
    : {
        className: 'lazyload',
        'data-src': imgSrc,
      };
  return (
    <Container {...props}>
      <img {...imageProps} alt={imgAlt} key={imgSrc} />
    </Container>
  );
}
