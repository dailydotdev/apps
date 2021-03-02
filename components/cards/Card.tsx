/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import rem from '../../macros/rem.macro';
import { typoBody } from '../../styles/typography';
import { focusOutline, multilineTextOverflow } from '../../styles/helpers';
import LazyImage from '../LazyImage';
import { ReactNode } from 'react';
import { smallRoundedImage } from '../utilities';
import { Comment } from '../../graphql/comments';

export const cardImageHeight = sizeN(40);

export const CardTitle = styled.h2`
  margin: ${sizeN(2)} 0;
  color: var(--theme-label-primary);
  font-weight: bold;
  -webkit-line-clamp: 3;
  ${typoBody}
  ${multilineTextOverflow}
`;

export const CardTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 ${sizeN(4)};
`;

export const CardImage = styled(LazyImage)`
  height: ${cardImageHeight};
  border-radius: ${sizeN(3)};
`;

export const CardSpace = styled.div`
  flex: 1;
`;

export const CardLink = styled.a`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`;

export const Card = styled.article`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: ${sizeN(2)};
  border-radius: ${sizeN(4)};
  border: ${rem(1)} solid var(--theme-divider-tertiary);
  background: var(--theme-background-secondary);
  box-shadow: var(--theme-shadow2);

  &:hover {
    border-color: var(--theme-divider-secondary);
  }

  & > * {
    pointer-events: none;
  }

  a,
  button,
  label {
    pointer-events: all;
    z-index: 1;
  }

  ${CardLink} {
    z-index: unset;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  height: ${sizeN(8)};
  align-items: center;
  margin: ${sizeN(1)} ${rem(-6)};

  & > * {
    margin: 0 ${rem(6)};
  }
`;

export const FeaturedCommentButton = styled.button`
  display: flex;
  padding: 0;
  background: none;
  border: none;
  border-radius: 100%;
  cursor: pointer;
  opacity: 0.64;
  ${focusOutline}
`;

export const featuredCommentsToButtons = (
  comments: Comment[],
  onClick: (comment: Comment) => unknown,
  selectedId?: string,
): ReactNode[] =>
  comments?.map((comment) => (
    <FeaturedCommentButton
      title={`See ${comment.author.name}'s comment`}
      onClick={() => onClick(comment)}
      key={comment.id}
      css={
        selectedId === comment.id &&
        css`
          opacity: 1;
        `
      }
    >
      <img
        src={comment.author.image}
        alt={`${comment.author.name}'s profile image`}
        css={smallRoundedImage}
        style={{ background: 'var(--theme-background-tertiary)' }}
      />
    </FeaturedCommentButton>
  ));
