import React, { ReactElement } from 'react';
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
import ReadTime from '../atoms/ReadTime';
import { UpvoteButton } from '../atoms/UpvoteButton';
import { CommentButton } from '../atoms/CommentButton';
import ShareButton from '../atoms/ShareButton';
import { CardContainer } from '../atoms/CardContainer';
import { Image } from '../atoms/Image';
import { cloudinary } from '../../../../lib/image';
import OptionButton from '../atoms/OptionButton';
import { ReadArticleButton } from '../atoms/ReadArticleButton';
import { CardType } from '../common';

export const ArticleCard = ({ post, index }: CardType): ReactElement => {
  return (
    <CardContainer data-item-index={index}>
      <Card>
        <CardButton post={post} />
        <header className="mx-2.5 my-1 flex h-8 items-center">
          <SourceButton source={post.source} />
          <div className="invisible ml-auto flex flex-row gap-2 group-hover/card:visible">
            <ReadArticleButton post={post} className="btn-primary" openNewTab />
            <OptionButton post={post} tooltipPlacement="top" />
          </div>
        </header>
        <section className="flex flex-1">
          <div className="mx-4 flex flex-1 flex-col">
            <Typography type={TypographyType.Title3} bold className="my-2">
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
        <section>
          <Image
            alt="Post Cover image"
            src={post.image}
            fallbackSrc={cloudinary.post.imageCoverPlaceholder}
            loading="lazy"
            className="my-2 w-full object-cover"
          />
        </section>
        <footer className="mx-4 flex flex-row justify-between">
          <UpvoteButton post={post} />
          <CommentButton post={post} />
          <ShareButton post={post} />
        </footer>
      </Card>
    </CardContainer>
  );
};
