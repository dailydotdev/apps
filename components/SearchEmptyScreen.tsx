/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { ReactElement } from 'react';
import MagnifyingIcon from '../icons/magnifying.svg';
import styled from '@emotion/styled';
import rem from '../macros/rem.macro';
import { typoCallout, typoTitle1 } from '../styles/typography';

const Container = styled.div`
  display: flex;
  width: 100%;
  max-width: ${rem(520)};
  flex-direction: column;
  align-self: center;
  padding: 0 ${rem(24)};
`;

export default function SearchEmptyScreen(): ReactElement {
  return (
    <Container>
      <MagnifyingIcon
        css={css`
          align-self: center;
          color: var(--theme-label-disabled);
          font-size: ${rem(80)};
        `}
      />
      <h2
        css={css`
          margin: ${rem(16)} 0;
          text-align: center;
          ${typoTitle1}
        `}
      >
        No results found
      </h2>
      <p
        css={css`
          margin: 0;
          padding: 0;
          color: var(--theme-label-secondary);
          text-align: center;
          ${typoCallout}
        `}
      >
        We cannot find the articles you are searching for. 🤷‍♀️
      </p>
    </Container>
  );
}
