import styled from 'styled-components';
import Linkify from 'linkifyjs/react';
import LazyImage from './LazyImage';
import {
  size10,
  size2,
  size3,
  size4,
  size6,
  size8,
  sizeN,
} from '../styles/sizes';
import {
  typoLil1,
  typoLil2Base,
  typoMicro2Base,
  typoSmall,
} from '../styles/typography';
import Loader from './Loader';
import { colorWater60 } from '../styles/colors';
import { laptop, mobileL, tablet } from '../styles/media';
import { pageMaxWidth } from '../styles/utilities';

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

export const CommentAuthor = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${typoLil2Base}
`;

export const CommentPublishDate = styled.time`
  color: var(--theme-disabled);
  ${typoSmall}
`;

export const CommentBox = styled(Linkify).attrs({
  tagName: 'div',
  options: { attributes: { rel: 'noopener noreferrer' } },
})`
  padding: ${size3} ${size4};
  background: var(--theme-background-highlight);
  border-radius: ${size2};
  white-space: pre-wrap;
  overflow-wrap: break-word;
  ${typoLil1}

  a {
    color: ${colorWater60};
    word-break: break-all;
  }
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
    border-left: 0.063rem solid var(--theme-separator);
    border-right: 0.063rem solid var(--theme-separator);
  }
`;
