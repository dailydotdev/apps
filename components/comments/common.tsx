import React, { ReactElement } from 'react';
import styled from '@emotion/styled';
import { typoCallout } from '../../styles/typography';
import Linkify from 'linkifyjs/react';
import sizeN from '../../macros/sizeN.macro';
import { css } from '@emotion/react';

export const CommentPublishDate = styled.time`
  color: var(--theme-label-tertiary);
  ${typoCallout}
`;

export const commentBoxStyle = css`
  padding: ${sizeN(3)} ${sizeN(4)};
  background: var(--theme-background-secondary);
  border-radius: ${sizeN(2)};
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
