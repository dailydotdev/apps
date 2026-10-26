import type { ReactElement } from 'react';
import React from 'react';
import type { SourcePostModeration } from '../../../graphql/squads';
import { PostType } from '../../../types';
import { Image, ImageType } from '../../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { getDomainFromUrl } from '../../../lib/links';

export const LinkPreview = ({
  title,
  image,
  domain,
}: {
  title?: string;
  image?: string;
  domain?: string;
}): ReactElement => (
  <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary p-2">
    <Image
      type={ImageType.Post}
      src={image}
      alt=""
      loading="lazy"
      className="h-12 w-16 shrink-0 rounded-8 object-cover tablet:h-14 tablet:w-20"
    />
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <Typography
        type={TypographyType.Footnote}
        bold
        className="line-clamp-2 break-words"
      >
        {title}
      </Typography>
      {domain && (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          truncate
        >
          {domain}
        </Typography>
      )}
    </div>
  </div>
);

const Commentary = ({ text }: { text: string }): ReactElement => (
  <Typography
    type={TypographyType.Callout}
    className="line-clamp-3 whitespace-pre-line break-words"
  >
    {text}
  </Typography>
);

// What the post says, trimmed to a few lines; the preview shows the rest.
export function SquadModerationContent({
  data,
}: {
  data: SourcePostModeration;
}): ReactElement {
  const { type, title, content, image, sharedPost, externalLink, pollOptions } =
    data;
  const editedPost = data.post;

  if (sharedPost) {
    return (
      <div className="flex flex-col gap-2">
        {!!title && title !== sharedPost.title && <Commentary text={title} />}
        <LinkPreview
          title={sharedPost.title}
          image={sharedPost.image}
          domain={sharedPost.domain ?? sharedPost.source?.name}
        />
      </div>
    );
  }

  // A new link keeps its own title and image; the commentary is the content.
  if (externalLink) {
    return (
      <div className="flex flex-col gap-2">
        {!!content && <Commentary text={content} />}
        <LinkPreview
          title={title}
          image={image}
          domain={getDomainFromUrl(externalLink)}
        />
      </div>
    );
  }

  if (type === PostType.Poll) {
    return (
      <div className="flex flex-col gap-2">
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Callout}
          bold
          className="break-words"
        >
          {title}
        </Typography>
        <ol className="flex flex-col gap-1">
          {[...(pollOptions ?? [])]
            .sort((a, b) => a.order - b.order)
            .map((option) => (
              <li
                key={option.order}
                className="truncate rounded-8 border border-border-subtlest-tertiary px-3 py-1.5 text-text-secondary typo-footnote"
              >
                {option.text}
              </li>
            ))}
        </ol>
      </div>
    );
  }

  const postImage = image || editedPost?.image;
  const postContent = content || editedPost?.content;

  return (
    <div className="flex gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Callout}
          bold
          className="line-clamp-2 break-words"
        >
          {title || editedPost?.title}
        </Typography>
        {!!postContent && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="line-clamp-3 break-words"
          >
            {postContent}
          </Typography>
        )}
      </div>
      {!!postImage && (
        <Image
          type={ImageType.Post}
          src={postImage}
          alt=""
          loading="lazy"
          className="h-16 w-24 shrink-0 rounded-12 object-cover"
        />
      )}
    </div>
  );
}
