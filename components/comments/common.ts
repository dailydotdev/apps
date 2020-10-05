import styled from 'styled-components';
import { typoLil1, typoLil2Base, typoSmall } from '../../styles/typography';
import Linkify from 'linkifyjs/react';
import { size2, size3, size4 } from '../../styles/sizes';
import { colorWater60 } from '../../styles/colors';

export const CommentAuthor = styled.div`
  color: var(--theme-primary);
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

  a:not(${CommentAuthor}) {
    color: ${colorWater60};
    word-break: break-all;
  }
`;
