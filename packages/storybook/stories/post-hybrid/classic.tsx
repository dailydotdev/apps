import type { ComponentType, ReactElement } from 'react';
import React from 'react';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { PostContent } from '@dailydotdev/shared/src/components/post/PostContent';
import { SquadPostContent } from '@dailydotdev/shared/src/components/post/SquadPostContent';
import { CollectionPostContent } from '@dailydotdev/shared/src/components/post/collection/CollectionPostContent';
import { PollPostContent } from '@dailydotdev/shared/src/components/post/poll/PollPostContent';
import { SocialTwitterPostContent } from '@dailydotdev/shared/src/components/post/SocialTwitterPostContent';
import { BriefPostContent } from '@dailydotdev/shared/src/components/post/brief/BriefPostContent';
import type { PostContentProps } from '@dailydotdev/shared/src/components/post/common';
import { PostWidgetPosition } from '@dailydotdev/shared/src/components/post/PostWidgets';
import { ActivePostContextProvider } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import type { PageProps } from './page';
import { railAdSlot, Shell, useOrganicAds } from './page';

// pages/posts/[id]'s CONTENT_MAP, for the types these stories cover.
const contentByType: Partial<
  Record<PostType, ComponentType<PostContentProps>>
> = {
  [PostType.Article]: PostContent as ComponentType<PostContentProps>,
  [PostType.VideoYouTube]: PostContent as ComponentType<PostContentProps>,
  [PostType.Share]: SquadPostContent as ComponentType<PostContentProps>,
  [PostType.Freeform]: SquadPostContent as ComponentType<PostContentProps>,
  [PostType.Collection]:
    CollectionPostContent as ComponentType<PostContentProps>,
  [PostType.Poll]: PollPostContent as ComponentType<PostContentProps>,
  [PostType.SocialTwitter]:
    SocialTwitterPostContent as ComponentType<PostContentProps>,
  [PostType.Brief]: BriefPostContent as ComponentType<PostContentProps>,
};

/**
 * Production's post page today, rendered from the real components with the
 * same props pages/posts/[id] passes, and the same organic slots drawn as
 * slot boxes. The baseline every other frame is compared against, and the
 * layout the dedicated types (brief, and in the redesign poll and X posts)
 * keep in every version.
 */
export const ClassicPostPage = ({
  post,
  viewer,
  programmatic = false,
  shell = true,
}: PageProps): ReactElement => {
  const ads = useOrganicAds(post, viewer, programmatic);
  const Content = contentByType[post.type] as ComponentType<PostContentProps>;
  const { column, segments } = ads;

  return (
    <Shell shell={shell}>
      <ActivePostContextProvider post={post}>
        <Content
          position="relative"
          isPostPage
          post={post}
          origin={Origin.ArticlePage}
          contentLeading={
            column?.leading && (
              <div className="hidden pb-2 pt-4 tablet:block">
                {column.leading}
              </div>
            )
          }
          renderSummarySegments={
            segments
              ? () => (
                  <>
                    {segments.map((segment, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <React.Fragment key={index}>
                        <div className="mb-6 overflow-hidden text-text-secondary">
                          <p className="select-text break-words typo-markdown">
                            {segment}
                          </p>
                        </div>
                        {index < segments.length - 1 && (
                          <div className="my-6">
                            {column?.inSummary?.(index)}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                )
              : undefined
          }
          aboveComments={
            column?.aboveComments && (
              <div className="my-6">{column.aboveComments}</div>
            )
          }
          commentAds={column?.comments}
          getWidgetRailAd={
            ads.isLive
              ? (position) =>
                  position === PostWidgetPosition.DirectAd ? railAdSlot : null
              : undefined
          }
          className={{
            container:
              'mb-16 min-h-page max-w-[69.25rem] tablet:mb-8 laptop:mb-0 laptop:pb-6 laptopL:pb-0',
            fixedNavigation: { container: 'flex laptop:hidden' },
            navigation: {
              container: 'flex tablet:hidden',
              actions: 'flex-1 justify-between',
            },
          }}
        />
      </ActivePostContextProvider>
    </Shell>
  );
};
