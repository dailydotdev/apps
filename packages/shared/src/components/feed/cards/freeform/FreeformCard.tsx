import React, { ReactElement, ReactNode, useMemo } from 'react';
import { Card } from '../atoms/Card';
import { CardButton } from '../atoms/CardAction';
import SourceButton from '../../../cards/SourceButton';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import MetaContainer from '../atoms/MetaContainer';
import CreatedAt from '../atoms/CreatedAt';
import { Separator } from '../../../cards/common';
import { UpvoteButton } from '../atoms/UpvoteButton';
import { CommentButton } from '../atoms/CommentButton';
import ShareButton from '../atoms/ShareButton';
import { CardContainer } from '../atoms/CardContainer';
import { Post } from '../../../../graphql/posts';
import OptionButton from '../atoms/OptionButton';
import { Flag } from '../atoms/Flag';
import { RaisedLabelType } from '../../../cards/RaisedLabel';
import { ProfilePicture } from '../../../ProfilePicture';
import ImageOrText from '../atoms/ImageOrText';

export type CardType = {
  post: Post & { index?: number };
  children?: ReactNode;
};
export const FreeformCard = ({ post }: CardType): ReactElement => {
  const clamp = useMemo(() => {
    if (post.image) {
      return 'line-clamp-3';
    }

    return post.contentHtml ? 'line-clamp-4' : 'line-clamp-9';
  }, [post]);

  return (
    <CardContainer>
      {post.pinnedAt && (
        <Flag type={RaisedLabelType.Pinned} description="Pinned" />
      )}
      <Card>
        <CardButton post={post} />
        <header className="relative m-2 mb-3 flex flex-row gap-2">
          <div className="relative">
            <SourceButton
              source={post.source}
              size="xsmall"
              className="absolute -bottom-2 -right-2"
            />
            <ProfilePicture user={post.author} size="large" />
          </div>
          <div className="ml-2 mr-6 flex flex-1 flex-col">
            <Typography type={TypographyType.Footnote} bold>
              {post.author.name}
            </Typography>
            <MetaContainer
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              <Typography bold>@{post.author.username}</Typography>
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
            <Typography type={TypographyType.Title3} bold className={clamp}>
              {post.title}
            </Typography>
          </div>
        </section>
        <ImageOrText post={post} />
        <footer className="mx-4 flex flex-row justify-between">
          <UpvoteButton post={post} />
          <CommentButton post={post} />
          <ShareButton post={post} />
        </footer>
      </Card>
    </CardContainer>
  );
};
