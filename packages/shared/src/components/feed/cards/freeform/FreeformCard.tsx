import React, { ReactElement, ReactNode, useMemo } from 'react';
import { sanitize } from 'dompurify';
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
import { Image } from '../atoms/Image';
import { cloudinary } from '../../../../lib/image';
import OptionButton from '../atoms/OptionButton';
import { Flag } from '../atoms/Flag';
import { RaisedLabelType } from '../../../cards/RaisedLabel';
import { ProfilePicture } from '../../../ProfilePicture';

export type CardType = {
  post: Post;
  children?: ReactNode;
};
export const FreeformCard = ({ post }: CardType): ReactElement => {
  const clamp = useMemo(() => {
    if (post.image) {
      return 'line-clamp-3';
    }

    return post.contentHtml ? 'line-clamp-4' : 'line-clamp-9';
  }, [post]);

  const content = useMemo(
    () =>
      post?.contentHtml ? sanitize(post.contentHtml, { ALLOWED_TAGS: [] }) : '',
    [post?.contentHtml],
  );

  const image = useMemo(() => {
    if (post?.image) {
      return post?.image;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(post?.contentHtml, 'text/html');
    const imgTag = doc.querySelector('img');
    if (imgTag) {
      return imgTag.getAttribute('src');
    }

    return undefined;
  }, [post?.contentHtml, post?.image]);

  const decodedText = useMemo(() => {
    const span = document.createElement('div');
    span.innerHTML = content || '';
    return span.innerText || content;
  }, [content]);

  return (
    <CardContainer>
      {post.pinnedAt && (
        <Flag type={RaisedLabelType.Pinned} description="Pinned" />
      )}
      <Card>
        <CardButton post={post} />
        <header className="flex relative flex-row gap-2 m-2 mb-3">
          <div className="relative">
            <SourceButton
              source={post.source}
              size="xsmall"
              className="absolute -right-2 -bottom-2"
            />
            <ProfilePicture user={post.author} size="large" />
          </div>
          <div className="flex flex-col flex-1 mr-6 ml-2">
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
          <div className="flex invisible group-hover/card:visible flex-row gap-2 self-start ml-auto">
            <OptionButton post={post} tooltipPlacement="top" />
          </div>
        </header>
        <section>
          <div className="px-2 pt-2 pb-3">
            <Typography type={TypographyType.Title3} bold className={clamp}>
              {post.title}
            </Typography>
          </div>
        </section>
        <section className="flex flex-col flex-1">
          {image && (
            <Image
              alt="Post Cover image"
              src={image}
              fallbackSrc={cloudinary.post.imageCoverPlaceholder}
              loading="lazy"
              className="object-cover my-2 w-full"
            />
          )}
          {content && (
            <Typography
              type={TypographyType.Callout}
              className="px-2 break-words line-clamp-6"
            >
              {decodedText}
            </Typography>
          )}
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
