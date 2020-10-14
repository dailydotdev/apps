import React, { ReactElement } from 'react';
import { Author } from '../../graphql/comments';
import styled from 'styled-components';
import { typoLil2Base, typoNuggets } from '../../styles/typography';
import { ProfileLink } from '../profile/ProfileLink';
import FeatherIcon from '../../icons/feather.svg';
import { size1, size2, size4 } from '../../styles/sizes';
import { colorCheese50 } from '../../styles/colors';

export interface CommentAuthorProps {
  postAuthorId: string | null;
  author: Author;
}

const Container = styled.div`
  color: var(--theme-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${typoLil2Base}
`;

const CommentAuthorBadge = styled.span`
  display: flex;
  align-items: center;
  margin-left: ${size2};
  color: ${colorCheese50};
  ${typoNuggets};

  .icon {
    font-size: ${size4};
    margin-right: ${size1};
  }
`;

export default function CommentAuthor({
  postAuthorId,
  author,
}: CommentAuthorProps): ReactElement {
  return (
    <Container as={ProfileLink} user={author} className="commentAuthor">
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
