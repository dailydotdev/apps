import React, { ReactElement, ReactNode } from 'react';
import { Card } from '../atoms/Card';
import { CardButton } from '../atoms/CardAction';
import SourceButton from '../../../cards/SourceButton';
import { ReadArticleButton } from '../../../cards/ReadArticleButton';
import OptionsButton from '../../../buttons/OptionsButton';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import MetaContainer from '../atoms/MetaContainer';
import CreatedAt from '../atoms/CreatedAt';
import { Separator } from '../../../cards/common';
import ReadTime from '../atoms/ReadTime';
import { CardImage } from '../../../cards/Card';
import { UpvoteButton } from '../atoms/UpvoteButton';
import { CommentButton } from '../atoms/CommentButton';
import ShareButton from '../atoms/ShareButton';
import { CardContainer } from '../atoms/CardContainer';
import { Post } from '../../../../graphql/posts';

export type CardType = {
  post: Post;
  children?: ReactNode;
};
export const ArticleCard = ({ post }: CardType): ReactElement => {
  return (
    <CardContainer className="group/card">
      <Card>
        <CardButton />
        <header className="flex items-center my-1 mx-2.5 h-8">
          <SourceButton source={post.source} />
          <div className="flex invisible group-hover/card:visible flex-row gap-2 ml-auto">
            <ReadArticleButton
              className="btn-primary"
              href="https://daily.dev"
              onClick={() => {}}
              openNewTab
            />
            <OptionsButton tooltipPlacement="top" />
          </div>
        </header>
        <section>
          <div className="mx-4">
            <Typography type={TypographyType.Title3} bold className="my-2">
              {post.title}
            </Typography>
            <MetaContainer
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              <CreatedAt createdAt="2023-10-10T12:00:00.000Z" />
              <Separator />
              <ReadTime readTime={5} />
            </MetaContainer>
          </div>
        </section>
        <section>
          <CardImage
            className="my-2 w-full"
            src="https://picsum.photos/500/500"
          />
        </section>
        <footer className="flex flex-row justify-between mx-4">
          <UpvoteButton post={post} />
          <CommentButton post={post} />
          <ShareButton post={post} />
        </footer>
      </Card>
    </CardContainer>
  );
};
