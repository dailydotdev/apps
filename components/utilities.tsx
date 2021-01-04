import styled from 'styled-components';
import LazyImage from './LazyImage';
import { size10, size4, size6, size8, sizeN } from '../styles/sizes';
import { typoDouble, typoMicro2, typoMicro2Base } from '../styles/typography';
import Loader from './Loader';
import { colorKetchup30 } from '../styles/colors';
import { laptop, mobileL, tablet } from '../styles/media';
import { pageMaxWidth } from '../styles/helpers';

export const RoundedImage = styled(LazyImage)`
  width: ${size10};
  height: ${size10};
  border-radius: 100%;
`;

export const SmallRoundedImage = styled(LazyImage)`
  width: ${size6};
  height: ${size6};
  border-radius: 100%;
`;

export const ButtonLoader = styled(Loader)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
`;

export const LegalNotice = styled.div`
  color: var(--theme-disabled);
  text-align: center;
  font-weight: bold;
  ${typoMicro2Base};

  a {
    display: inline-block;
    text-decoration: underline;
    color: inherit;
    @supports (display: contents) {
      display: contents;
    }
  }
`;

export const PageContainer = styled.main`
  position: relative;
  display: flex;
  width: 100%;
  max-width: ${pageMaxWidth};
  flex-direction: column;
  align-items: stretch;
  padding: ${size6} ${size4} ${sizeN(16)};
  z-index: 1;

  ${mobileL} {
    padding-bottom: ${size6};
  }

  ${tablet} {
    padding-left: ${size8};
    padding-right: ${size8};
    align-self: center;
  }

  ${laptop} {
    min-height: 100vh;
    border-left: 0.063rem solid var(--theme-divider-tertiary);
    border-right: 0.063rem solid var(--theme-divider-tertiary);
  }
`;

export const FormErrorMessage = styled.div.attrs({ role: 'alert' })`
  margin-top: ${size4};
  color: ${colorKetchup30};
  ${typoMicro2}
`;

export const ProfileHeading = styled.h1`
  margin: 0;
  align-self: flex-start;
  text-transform: uppercase;
  ${typoDouble}
`;
