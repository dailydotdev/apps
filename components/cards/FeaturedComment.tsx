/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { ReactElement } from 'react';
import { Comment } from '../../graphql/comments';
import {
  CardHeader,
  CardTextContainer,
  featuredCommentsToButtons,
} from './Card';
import TertiaryButton from '../buttons/TertiaryButton';
import ArrowIcon from '../../icons/arrow.svg';
import CommentIcon from '../../icons/comment.svg';
import { typoCallout } from '../../styles/typography';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import { multilineTextOverflow } from '../../styles/helpers';
import rem from '../../macros/rem.macro';
import Link from 'next/link';

export type FeaturedCommentProps = {
  featuredComments: Comment[];
  comment: Comment;
  onBack: () => unknown;
  onCommentClick: (comment: Comment) => unknown;
};

const Title = styled.h4`
  margin: ${sizeN(2)} 0;
  ${typoCallout}
`;

const Content = styled.p`
  margin: 0;
  padding: 0;
  flex: 1;
  color: var(--theme-label-tertiary);
  ${typoCallout}
  ${multilineTextOverflow}
`;

const Divider = styled.div`
  width: 100%;
  height: ${rem(1)};
  margin: ${sizeN(2)} 0;
  background: var(--theme-divider-tertiary);
`;

export default function FeaturedComment({
  featuredComments,
  comment,
  onCommentClick,
  onBack,
}: FeaturedCommentProps): ReactElement {
  return (
    <>
      <CardTextContainer
        css={css`
          flex: 1;
        `}
      >
        <CardHeader>
          <TertiaryButton
            icon={
              <ArrowIcon
                css={css`
                  transform: rotate(-90deg);
                `}
              />
            }
            buttonSize="small"
            title="Back"
            onClick={onBack}
          />
          {featuredCommentsToButtons(
            featuredComments,
            onCommentClick,
            comment.id,
          )}
        </CardHeader>
        <Title>{comment.author.name}</Title>
        <Content>{comment.content}</Content>
        <Divider />
      </CardTextContainer>
      <Link href={comment.permalink} passHref>
        <TertiaryButton
          as="a"
          target="_blank"
          rel="noopener"
          buttonSize="small"
          icon={<CommentIcon />}
          css={css`
            align-self: center;
          `}
        >
          View comment
        </TertiaryButton>
      </Link>
    </>
  );
}
