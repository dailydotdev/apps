import type { ReactElement } from 'react';
import React, { useState } from 'react';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { TagStepFrame } from '../../TagStepFrame';
import type { VariantProps } from '../../TagStepFrame';
import { getPickMoreCopy, usePreviewFeed } from '../../previewData';
import { PreviewTrigger } from '../../PreviewKit';

const NOTIFICATIONS = 3;

const tomorrow = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(new Date(Date.now() + 24 * 60 * 60 * 1000));

export const TomorrowMorning = ({
  onContinue,
  initialOpen = false,
}: VariantProps): ReactElement => {
  const { posts, isReady, remaining } = usePreviewFeed();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const isVisible = isOpen && isReady;

  return (
    <TagStepFrame isPreviewOpen={initialOpen} onContinue={onContinue}>
      <PreviewTrigger
        disabledLabel={getPickMoreCopy(remaining)}
        isDisabled={!isReady}
        isOpen={isVisible}
        label="See tomorrow morning"
        onClick={() => setIsOpen((value) => !value)}
        posts={posts}
      />
      {isVisible && (
        <section className="flex w-full max-w-[22rem] flex-col items-center gap-4">
          <div className="flex w-full flex-col items-center gap-5 rounded-[2.5rem] border-8 border-surface-float bg-gradient-to-b from-accent-cabbage-subtlest to-background-default px-4 pb-8 pt-10">
            <div className="flex flex-col items-center">
              <span className="text-text-secondary typo-callout">
                {tomorrow}
              </span>
              <span className="font-bold tabular-nums typo-giga2">8:00</span>
            </div>
            <div className="flex w-full flex-col gap-2">
              {posts
                .slice(0, NOTIFICATIONS)
                .map(({ post, matchedTags }, index) => (
                  <div
                    key={post.id}
                    className="flex animate-composer-in gap-3 rounded-20 bg-surface-float p-3 backdrop-blur-xl"
                    style={{ animationDelay: `${index * 160}ms` }}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-10 bg-background-default">
                      <LogoIcon className={{ container: 'h-5' }} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex justify-between text-text-tertiary typo-caption1">
                        <span className="font-bold text-text-primary">
                          Trending in #{matchedTags[0]}
                        </span>
                        <span>now</span>
                      </span>
                      <span className="line-clamp-2 text-text-secondary typo-footnote">
                        {post.title}
                      </span>
                    </span>
                  </div>
                ))}
            </div>
          </div>
          <p className="text-center text-text-tertiary typo-footnote">
            Your tags pick what waits for you each morning. A reading reminder
            brings it to your lock screen.
          </p>
        </section>
      )}
    </TagStepFrame>
  );
};
