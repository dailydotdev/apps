import type { ReactElement } from 'react';
import React from 'react';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { TagStepFrame } from '../TagStepFrame';
import type { VariantProps } from '../TagStepFrame';
import { getPickMoreCopy, usePreviewFeed } from '../previewData';
import { MatchedTag } from '../PreviewKit';
import { ShortList } from './ShortList';

const PHONE_POSTS = 6;

const Phone = (): ReactElement => {
  const { tags, posts, isReady, remaining } = usePreviewFeed();

  return (
    <aside className="sticky top-6 flex flex-col items-center gap-3">
      <div className="relative flex h-[38rem] w-[19rem] flex-col overflow-hidden rounded-[2.75rem] border-8 border-surface-float bg-background-default shadow-2">
        <div className="mx-auto mt-2 h-5 w-24 rounded-max bg-surface-float" />
        <div className="flex items-center gap-2 px-4 pb-2 pt-3">
          <LogoIcon className={{ container: 'h-5' }} />
          <span className="font-bold typo-callout">My feed</span>
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="shrink-0 rounded-8 bg-surface-float px-2 py-0.5 text-text-secondary typo-caption1"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="no-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto px-3 pb-6">
          {isReady
            ? posts.slice(0, PHONE_POSTS).map(({ post, matchedTags }) => (
                <article
                  key={post.id}
                  className="flex animate-composer-in flex-col gap-1.5 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-2 pb-3"
                >
                  <Image
                    alt=""
                    className="h-28 w-full rounded-12 object-cover"
                    src={post.image}
                    type={ImageType.Post}
                  />
                  <span className="line-clamp-2 px-1 font-bold typo-footnote">
                    {post.title}
                  </span>
                  <span className="px-1 typo-caption1">
                    <MatchedTag tag={matchedTags[0]} />
                  </span>
                </article>
              ))
            : Array.from({ length: 3 }, (_, index) => (
                <ElementPlaceholder key={index} className="h-44 rounded-16" />
              ))}
        </div>
      </div>
      <p className="text-text-tertiary typo-footnote">
        {isReady ? 'This is your feed on day one.' : getPickMoreCopy(remaining)}
      </p>
    </aside>
  );
};

export const PhoneMock = ({
  onContinue,
  initialOpen,
}: VariantProps): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);

  if (!isLaptop) {
    return <ShortList initialOpen={initialOpen} onContinue={onContinue} />;
  }

  return <TagStepFrame aside={<Phone />} onContinue={onContinue} />;
};
