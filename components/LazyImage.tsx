import 'lazysizes';
import React, { HTMLAttributes, ReactElement } from 'react';
import styled from 'styled-components';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string;
  imgAlt: string;
  background?: string;
  ratio?: string;
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
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  img.lazyload:not([src]) {
    visibility: hidden;
  }
`;

export default function LazyImage(props: Props): ReactElement {
  const { imgSrc, imgAlt } = props;
  return (
    <Container {...props}>
      <img className="lazyload" data-src={imgSrc} alt={imgAlt} key={imgSrc} />
    </Container>
  );
}
