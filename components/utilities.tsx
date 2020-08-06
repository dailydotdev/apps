import styled from 'styled-components';
import LazyImage from './LazyImage';
import { size10, size2, size3, size4 } from '../styles/sizes';
import { typoLil2Base, typoMicro1, typoSmall } from '../styles/typography';

export const RoundedImage = styled(LazyImage)`
  width: ${size10};
  height: ${size10};
  border-radius: 100%;
`;

export const CommentAuthor = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${typoLil2Base}
`;

export const CommentPublishDate = styled.div`
  color: var(--theme-disabled);
  ${typoSmall}
`;

export const CommentBox = styled.div`
  padding: ${size3} ${size4};
  background: var(--theme-background-highlight);
  border-radius: ${size2};
  ${typoMicro1}
`;
