import styled from 'styled-components';
import { typoCallout } from '../../styles/typography';
import Linkify from 'linkifyjs/react';
import { size2, size3, size4 } from '../../styles/sizes';

export const CommentPublishDate = styled.time`
  color: var(--theme-label-tertiary);
  ${typoCallout}
`;

export const CommentBox = styled(Linkify).attrs({
  tagName: 'div',
  options: { attributes: { rel: 'noopener nofollow' } },
})`
  padding: ${size3} ${size4};
  background: var(--theme-background-secondary);
  border-radius: ${size2};
  white-space: pre-wrap;
  overflow-wrap: break-word;
  ${typoCallout}

  a:not(.commentAuthor) {
    color: var(--theme-label-link);
    word-break: break-all;
  }
`;
