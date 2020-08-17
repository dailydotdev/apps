import styled from 'styled-components';
import LazyImage from './LazyImage';
import { size10, size2, size3, size4, size6 } from '../styles/sizes';
import { typoLil2Base, typoMicro1, typoSmall } from '../styles/typography';
import Loader from './Loader';

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

export const CommentBox = styled.div`
  padding: ${size3} ${size4};
  background: var(--theme-background-highlight);
  border-radius: ${size2};
  ${typoMicro1}
`;

export const ButtonLoader = styled(Loader)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
`;
