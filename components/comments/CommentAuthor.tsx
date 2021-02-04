import React, { ReactElement } from 'react';
import { Author } from '../../graphql/comments';
import styled from '@emotion/styled';
import { typoCallout, typoFootnote } from '../../styles/typography';
import { ProfileLink } from '../profile/ProfileLink';
import FeatherIcon from '../../icons/feather.svg';
import sizeN from '../../macros/sizeN.macro';

export interface CommentAuthorProps {
  postAuthorId: string | null;
  author: Author;
}

const Container = styled(ProfileLink)`
  color: var(--theme-label-primary);
  white-space: nowrap;
  overflow: hidden;
  font-weight: bold;
  ${typoCallout}
`;

const CommentAuthorBadge = styled.span`
  display: flex;
  align-items: center;
  margin-left: ${sizeN(2)};
  color: var(--theme-status-help);
  ${typoFootnote}

  .icon {
    font-size: ${sizeN(4)};
    margin-right: ${sizeN(1)};
  }
`;

export default function CommentAuthor({
  postAuthorId,
  author,
}: CommentAuthorProps): ReactElement {
  return (
    <Container user={author} className="commentAuthor">
      {author.name}
      {author.id === postAuthorId && (
        <CommentAuthorBadge>
          <FeatherIcon />
          Author
        </CommentAuthorBadge>
      )}
    </Container>
  );
}
