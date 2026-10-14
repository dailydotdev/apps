import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import { TagStepFrame } from '../TagStepFrame';
import type { VariantProps } from '../TagStepFrame';
import { getPickMoreCopy, usePreviewFeed } from '../previewData';
import { MatchedTag, PreviewEnd, PreviewTrigger } from '../PreviewKit';

const SIDE_STORIES = 4;

const editionDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(new Date());

export const FirstEdition = ({
  onContinue,
  initialOpen = false,
}: VariantProps): ReactElement => {
  const { tags, posts, isReady, remaining } = usePreviewFeed();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const isVisible = isOpen && isReady;
  const [lead, ...rest] = posts;

  return (
    <TagStepFrame isPreviewOpen={initialOpen} onContinue={onContinue}>
      <PreviewTrigger
        disabledLabel={getPickMoreCopy(remaining)}
        isDisabled={!isReady}
        isOpen={isVisible}
        label="Read your first edition"
        onClick={() => setIsOpen((value) => !value)}
        posts={posts}
      />
      {isVisible && lead && (
        <article className="flex w-full max-w-[44rem] flex-col gap-4 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-5 tablet:p-8">
          <header className="flex flex-col items-center gap-1 border-b-2 border-text-primary pb-3 text-center">
            <span className="font-bold tracking-tight typo-mega3">
              The daily.dev
            </span>
            <span className="flex w-full justify-between border-t border-border-subtlest-tertiary pt-1 text-text-tertiary typo-caption1">
              <span>{editionDate}</span>
              <span className="truncate pl-4">
                Edition for {tags.map((tag) => `#${tag}`).join(' ')}
              </span>
            </span>
          </header>
          <section className="flex flex-col gap-3 tablet:flex-row-reverse tablet:gap-6">
            <Image
              alt=""
              className="h-44 w-full rounded-12 object-cover tablet:h-auto tablet:w-1/2"
              src={lead.post.image}
              type={ImageType.Post}
            />
            <div className="flex flex-col gap-2 tablet:w-1/2">
              <span className="typo-footnote">
                <MatchedTag tag={lead.matchedTags[0]} />
              </span>
              <h2 className="font-bold typo-title1">{lead.post.title}</h2>
              <span className="text-text-tertiary typo-footnote">
                {lead.post.source?.name} · {lead.post.numUpvotes} upvotes
              </span>
            </div>
          </section>
          <section className="grid grid-cols-1 gap-x-6 border-t border-border-subtlest-tertiary tablet:grid-cols-2">
            {rest.slice(0, SIDE_STORIES).map(({ post, matchedTags }) => (
              <div
                key={post.id}
                className="flex flex-col gap-1 border-b border-border-subtlest-tertiary py-3"
              >
                <span className="typo-caption1">
                  <MatchedTag tag={matchedTags[0]} />
                </span>
                <h3 className="line-clamp-2 font-bold typo-callout">
                  {post.title}
                </h3>
                <span className="text-text-tertiary typo-caption1">
                  {post.source?.name}
                </span>
              </div>
            ))}
          </section>
          <PreviewEnd isOnSurface>
            A new edition is ready every time you open daily.dev.
          </PreviewEnd>
        </article>
      )}
    </TagStepFrame>
  );
};
