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
        <header className="relative m-2 mb-3 flex flex-row gap-2">
          <div className="relative">
            <SourceButton source={post.source} size="large" />
            <ProfilePicture
              user={post.author}
              size="xsmall"
              className="-right-2.5 top-7"
              absolute
            />
          </div>
          <div className="ml-2 mr-6 flex flex-1 flex-col">
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
          <div className="invisible ml-auto flex flex-row gap-2 self-start group-hover/card:visible">
            <OptionButton post={post} tooltipPlacement="top" />
          </div>
        </header>
        <section>
          <div className="px-2 pb-3 pt-2">
            <Typography type={TypographyType.Callout} className="line-clamp-6">
              {post.title}
            </Typography>
          </div>
        </section>
        <TextImage
          className="mb-2 gap-2"
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
        <footer className="mx-4 flex flex-row justify-between">
          <UpvoteButton post={post} />
          <CommentButton post={post} />
          <ShareButton post={post} />
        </footer>
      </Card>
    </CardContainer>
  );
};
