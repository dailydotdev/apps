import React, { ReactElement } from 'react';
import { Card } from '../atoms/Card';
import { CardButton } from '../atoms/CardAction';
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
import OptionButton from '../atoms/OptionButton';
import { CardType } from '../common';
import ImageOrText from '../atoms/ImageOrText';
import { CollectionHeader } from '../atoms/CollectionHeader';
import ReadTime from '../atoms/ReadTime';

export const CollectionCard = ({ post }: CardType): ReactElement => {
  return (
    <CardContainer>
      <Card>
        <CardButton post={post} />
        <header className="mx-2.5 my-1 flex h-8 items-center">
          <CollectionHeader
            sources={post.collectionSources}
            totalSources={post.numCollectionSources}
          />
          <div className="invisible ml-auto flex flex-row gap-2 group-hover/card:visible">
            <OptionButton post={post} tooltipPlacement="top" />
          </div>
        </header>
        <section className="flex flex-1">
          <div className="mx-4 flex flex-1 flex-col">
            <Typography
              type={TypographyType.Title3}
              bold
              className="my-2 line-clamp-3"
            >
              {post.title}
            </Typography>
            <div className="flex-1" />
            <MetaContainer
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              <CreatedAt createdAt={post.createdAt} />
              <Separator />
              <ReadTime readTime={post.readTime} />
            </MetaContainer>
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
