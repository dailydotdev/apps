import styled from 'styled-components/macro';
import { size1px, size2, size3, size4, sizeN } from '../../styles/sizes';
import { typoBody } from '../../styles/typography';
import { multilineTextOverflow } from '../../styles/helpers';
import LazyImage from '../LazyImage';

export const cardImageHeight = sizeN(40);

export const CardTitle = styled.h2`
  margin: ${size2} 0;
  color: var(--theme-label-primary);
  font-weight: bold;
  -webkit-line-clamp: 3;
  ${typoBody}
  ${multilineTextOverflow}
`;

export const CardTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 ${size4};
`;

export const CardImage = styled(LazyImage)`
  height: ${cardImageHeight};
  border-radius: ${size3};
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
  padding: ${size2};
  border-radius: ${size4};
  border: ${size1px} solid var(--theme-divider-tertiary);
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
