import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import rem from '../../macros/rem.macro';
import { typoBody } from '../../styles/typography';
import { multilineTextOverflow } from '../../styles/helpers';
import LazyImage from '../LazyImage';

export const cardImageHeight = sizeN(40);

export const CardTitle = styled.h2`
  margin: ${sizeN(2)} 0;
  color: var(--theme-label-primary);
  font-weight: bold;
  -webkit-line-clamp: 3;
  ${typoBody}
  ${multilineTextOverflow}
`;

export const CardTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 ${sizeN(4)};
`;

export const CardImage = styled(LazyImage)`
  height: ${cardImageHeight};
  border-radius: ${sizeN(3)};
`;

export const CardSpace = styled.div`
  flex: 1;
`;

export const CardLink = styled.a`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`;

export const Card = styled.article`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: ${sizeN(2)};
  border-radius: ${sizeN(4)};
  border: ${rem(1)} solid var(--theme-divider-tertiary);
  background: var(--theme-background-secondary);
  box-shadow: var(--theme-shadow2);

  &:hover {
    border-color: var(--theme-divider-secondary);
  }

  & > * {
    pointer-events: none;
  }

  a,
  button,
  label {
    pointer-events: all;
    z-index: 1;
  }

  ${CardLink} {
    z-index: unset;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  height: ${sizeN(8)};
  align-items: center;
  margin: ${sizeN(1)} ${rem(-6)};

  & > * {
    margin: 0 ${rem(6)};
  }
`;
