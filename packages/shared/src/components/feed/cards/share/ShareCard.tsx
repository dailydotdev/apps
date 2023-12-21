import React, { ReactElement } from 'react';
import { CardContainer } from '../atoms/CardContainer';
import { Card } from '../atoms/Card';
import { CardButton } from '../atoms/CardAction';
import SourceButton from '../../../cards/SourceButton';
import { ProfilePicture } from '../../../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import MetaContainer from '../atoms/MetaContainer';
import { Separator } from '../../../cards/common';
import CreatedAt from '../atoms/CreatedAt';
import TextImage from '../atoms/TextImage';
import { UpvoteButton } from '../atoms/UpvoteButton';
import { CommentButton } from '../atoms/CommentButton';
import ShareButton from '../atoms/ShareButton';
import OptionButton from '../atoms/OptionButton';
import { CardType } from '../common';

export const ShareCard = ({ post }: CardType): ReactElement => {
  return (
    <CardContainer>
      <Card>
        <CardButton post={post} />
        <header className="flex relative flex-row gap-2 m-2 mb-3">
          <div className="relative">
            <SourceButton source={post.source} size="large" />
            <ProfilePicture
              user={post.author}
              size="xsmall"
              className="top-7 -right-2.5"
              absolute
            />
          </div>
          <div className="flex flex-col flex-1 mr-6 ml-2">
            <Typography type={TypographyType.Footnote} bold>
              Watercooler
            </Typography>
            <MetaContainer
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              <Typography bold>{post.author.name}</Typography>
              <Separator />
              <CreatedAt createdAt={post.createdAt} />
            </MetaContainer>
          </div>
          <div className="flex invisible group-hover/card:visible flex-row gap-2 self-start ml-auto">
            <OptionButton post={post} tooltipPlacement="top" />
          </div>
        </header>
        <section>
          <div className="px-2 pt-2 pb-3">
            <Typography type={TypographyType.Callout} className="line-clamp-6">
              {post.title}
            </Typography>
          </div>
        </section>
        <TextImage
          className="gap-2 mb-2"
          text={
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              {post.sharedPost.title}
            </Typography>
          }
          image={post.sharedPost.image}
        />
        <footer className="flex flex-row justify-between mx-4">
          <UpvoteButton post={post} />
          <CommentButton post={post} />
          <ShareButton post={post} />
        </footer>
      </Card>
    </CardContainer>
  );
};
