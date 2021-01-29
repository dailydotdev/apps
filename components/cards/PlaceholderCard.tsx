import React, { HTMLAttributes, ReactElement } from 'react';
import styled from '@emotion/styled';
import { cardImageHeight, CardSpace, CardTextContainer } from './Card';
import { size2, size3, size4, size6 } from '../../styles/sizes';
import { ElementPlaceholder } from '../utilities';

const Source = styled(ElementPlaceholder)`
  width: 1em;
  height: 1em;
  font-size: ${size6};
  border-radius: 100%;
`;

const Text = styled(ElementPlaceholder)`
  width: 1em;
  height: ${size3};
  border-radius: ${size3};
`;

const Image = styled(ElementPlaceholder)`
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
