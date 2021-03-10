/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { ReactElement } from 'react';
import { Comment } from '../../graphql/comments';
import {
  CardHeader,
  CardTextContainer,
  featuredCommentsToButtons,
} from './Card';
import ArrowIcon from '../../icons/arrow.svg';
import CommentIcon from '../../icons/comment.svg';
import { typoCallout } from '../../styles/typography';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import { multilineTextOverflow } from '../../styles/helpers';
import rem from '../../macros/rem.macro';
import Link from 'next/link';
import Button from '../buttons/Button';
import { getTooltipProps } from '../../lib/tooltip';

export type FeaturedCommentProps = {
  featuredComments: Comment[];
  comment: Comment;
  onBack: () => unknown;
  onCommentClick: (comment: Comment) => unknown;
  className?: string;
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
  className,
}: FeaturedCommentProps): ReactElement {
  return (
    <CardTextContainer
      css={css`
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        padding: ${sizeN(2)};
      `}
      className={className}
    >
      <CardHeader>
        <Button
          icon={
            <ArrowIcon
              css={css`
                transform: rotate(-90deg);
              `}
            />
          }
          buttonSize="small"
          {...getTooltipProps('Back')}
          onClick={onBack}
          className="btn-tertiary"
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
      <Link href={comment.permalink} passHref>
        <Button
          as="a"
          target="_blank"
          rel="noopener"
          buttonSize="small"
          icon={<CommentIcon />}
          css={css`
            align-self: center;
          `}
          className="btn-tertiary"
        >
          View comment
        </Button>
      </Link>
    </CardTextContainer>
  );
}
