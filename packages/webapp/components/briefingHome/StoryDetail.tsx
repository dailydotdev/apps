import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  UpvoteIcon,
  DiscussIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  ProfilePicture,
  ProfileImageSize,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import type { StoryItem } from './types';
import { briefCopy } from './copy';

const stripMd = (s: string): string =>
  s
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]{1,2}([^*_\n]+)[*_]{1,2}/g, '$1');

interface StoryDetailProps {
  story: StoryItem;
}

export const StoryDetail = ({ story }: StoryDetailProps): ReactElement => {
  const comments = story.highlightedComments.slice(0, 3);
  return (
    <div className="mt-3 flex flex-col gap-6 pl-1 pt-2">
      <div className="rounded-12 border-l-2 border-brand-default bg-brand-float p-4">
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Brand}
          bold
          className="mb-2 uppercase tracking-[0.14em]"
        >
          {briefCopy.tldrTag}
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          className="!leading-relaxed"
        >
          {story.summary}
        </Typography>
      </div>

      {comments.length > 0 ? (
        <section>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
            bold
            className="mb-3 uppercase tracking-[0.14em]"
          >
            {briefCopy.conversationLabel}
          </Typography>
          <ul className="flex flex-col gap-4">
            {comments.map((c) => (
              <li key={c.username} className="flex gap-3">
                <ProfilePicture
                  user={{
                    id: c.username,
                    username: c.username,
                    image: c.userImage,
                  }}
                  size={ProfileImageSize.Small}
                  rounded="full"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Secondary}
                      bold
                    >
                      @{c.username}
                    </Typography>
                    <span className="inline-flex items-center gap-1 text-text-quaternary">
                      <UpvoteIcon
                        size={IconSize.XXSmall}
                        className="text-accent-avocado-default"
                      />
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Quaternary}
                      >
                        {c.upvotes}
                      </Typography>
                    </span>
                  </div>
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Tertiary}
                    className="!leading-snug"
                  >
                    {stripMd(c.content)}
                  </Typography>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          bold
          className="mb-3 uppercase tracking-[0.14em]"
        >
          {briefCopy.threadLabel(story.posts.length)}
        </Typography>
        <ul className="-mx-2 flex gap-2 overflow-x-auto pb-2">
          {story.posts.map((p) => (
            <li key={p.id} className="shrink-0 basis-[12rem]">
              <a
                href={`https://app.daily.dev/posts/${p.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col gap-2 rounded-10 p-2 transition-colors hover:bg-surface-float"
              >
                {p.image ? (
                  <div className="aspect-video overflow-hidden rounded-8 bg-surface-float">
                    <img
                      src={p.image}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-8 bg-surface-float" />
                )}
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Primary}
                  className="line-clamp-2 !leading-snug"
                >
                  {p.title}
                </Typography>
                <div className="flex items-center gap-3 text-text-quaternary">
                  <span className="inline-flex items-center gap-1">
                    <UpvoteIcon size={IconSize.XXSmall} />
                    <Typography
                      type={TypographyType.Caption2}
                      color={TypographyColor.Quaternary}
                    >
                      {p.upvotes}
                    </Typography>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <DiscussIcon size={IconSize.XXSmall} />
                    <Typography
                      type={TypographyType.Caption2}
                      color={TypographyColor.Quaternary}
                    >
                      {p.comments}
                    </Typography>
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
