import React, {
  forwardRef,
  HTMLAttributes,
  LegacyRef,
  ReactElement,
} from 'react';
import styled from '@emotion/styled';
import { cardImageHeight, CardSpace, CardTextContainer } from './Card';
import sizeN from '../../macros/sizeN.macro';
import { ElementPlaceholder } from '../utilities';

const Source = styled(ElementPlaceholder)`
  width: 1em;
  height: 1em;
  font-size: ${sizeN(6)};
  border-radius: 100%;
`;

const Text = styled(ElementPlaceholder)`
  width: 1em;
  height: ${sizeN(3)};
  border-radius: ${sizeN(3)};
`;

const Image = styled(ElementPlaceholder)`
  border-radius: ${sizeN(3)};
  height: ${cardImageHeight};
`;

const Container = styled.article`
  display: flex;
  flex-direction: column;
  border-radius: ${sizeN(4)};
  padding: ${sizeN(2)};
  background: var(--theme-post-disabled);

  ${Source}, ${Text}, ${CardSpace}, ${Image} {
    margin: ${sizeN(2)} 0;
  }
`;

export type PlaceholderCardProps = HTMLAttributes<HTMLDivElement>;

export default forwardRef(function PlaceholderCard(
  props: PlaceholderCardProps,
  ref: LegacyRef<HTMLElement>,
): ReactElement {
  return (
    <Container aria-busy {...props} ref={ref}>
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
});
