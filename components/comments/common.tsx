import React, { ReactElement } from 'react';
import styled from '@emotion/styled';
import { typoCallout } from '../../styles/typography';
import Linkify from 'linkifyjs/react';
import { size2, size3, size4 } from '../../styles/sizes';
import { css } from '@emotion/react';

export const CommentPublishDate = styled.time`
  color: var(--theme-label-tertiary);
  ${typoCallout}
`;

export const commentBoxStyle = css`
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

const StyledLinkfy = styled(Linkify)`
  ${commentBoxStyle}
`;

export const CommentBox = (props?: unknown): ReactElement => (
  <StyledLinkfy
    tagName="div"
    options={{ attributes: { rel: 'noopener nofollow' } }}
    {...props}
  />
);
