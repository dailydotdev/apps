import React, { HTMLAttributes, ReactElement } from 'react';
import styled, { keyframes } from 'styled-components/macro';
import { cardImageHeight, CardSpace, CardTextContainer } from './Card';
import { size2, size3, size4, size6 } from '../../styles/sizes';

const PlaceholderShimmer = keyframes`
  100% {
    transform: translateX(100%);
  }
`;

const Placeholder = styled.div`
  position: relative;
  overflow: hidden;
  background: var(--theme-background-secondary);

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--theme-background-secondary),
      var(--theme-background-tertiary) 15%,
      var(--theme-background-secondary)
    );
    transform: translateX(-100%);
    animation: ${PlaceholderShimmer} 1.25s infinite linear;
    will-change: transform;
  }
`;

const Source = styled(Placeholder)`
  width: 1em;
  height: 1em;
  font-size: ${size6};
  border-radius: 100%;
`;

const Text = styled(Placeholder)`
  width: 1em;
  height: ${size3};
  border-radius: ${size3};
`;

const Image = styled(Placeholder)`
  border-radius: ${size3};
  height: ${cardImageHeight};
`;

const Container = styled.article`
  display: flex;
  flex-direction: column;
  border-radius: ${size4};
  padding: ${size2};
  background: var(--theme-post-disabled);

  ${Source}, ${Text}, ${CardSpace}, ${Image} {
    margin: ${size2} 0;
  }
`;

export type PlaceholderCardProps = HTMLAttributes<HTMLDivElement>;

export function PlaceholderCard(props: PlaceholderCardProps): ReactElement {
  return (
    <Container aria-busy {...props}>
      <CardTextContainer>
        <Source />
        <Text style={{ width: '100%' }} />
        <Text style={{ width: '100%' }} />
        <Text style={{ width: '80%' }} />
      </CardTextContainer>
      <CardSpace />
      <Image />
      <CardTextContainer>
        <Text style={{ width: '32%' }} />
      </CardTextContainer>
    </Container>
  );
}
