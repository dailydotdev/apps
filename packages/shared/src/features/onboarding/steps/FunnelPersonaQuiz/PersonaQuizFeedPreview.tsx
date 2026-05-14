import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../../graphql/posts';
import { ArticleList } from '../../../../components/cards/article/ArticleList';
import { ArticleGrid } from '../../../../components/cards/article/ArticleGrid';
import { ActiveFeedContext } from '../../../../contexts/ActiveFeedContext';
import { RequestKey } from '../../../../lib/query';
import { useViewSize, ViewSize } from '../../../../hooks';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';

interface PersonaQuizFeedPreviewProps {
  posts: Post[];
}

const PREVIEW_LIMIT = 4;

// No-op handlers — preview cards are non-interactive. The
// `ActiveFeedContext` queryKey already suppresses link wrapping and
// trending badges via `useFeedPreviewMode`.
const noop = (): void => undefined;

export const PersonaQuizFeedPreview = ({
  posts,
}: PersonaQuizFeedPreviewProps): ReactElement | null => {
  const isTablet = useViewSize(ViewSize.Tablet);

  const contextValue = useMemo(
    () => ({
      queryKey: [RequestKey.FeedPreview, 'persona-quiz'] as const,
      items: [],
    }),
    [],
  );

  if (posts.length === 0) {
    return null;
  }

  const visible = posts.slice(0, PREVIEW_LIMIT);

  return (
    <ActiveFeedContext.Provider value={contextValue}>
      <section className="flex w-full flex-col gap-3 px-4 pb-8 tablet:mx-auto tablet:max-w-3xl">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="uppercase tracking-wider"
        >
          Sneak peek of your feed
        </Typography>
        <div
          className={classNames(
            'grid gap-3',
            isTablet ? 'grid-cols-2' : 'grid-cols-1',
          )}
        >
          {visible.map((post) =>
            isTablet ? (
              <ArticleGrid
                key={post.id}
                post={post}
                onPostClick={noop}
                onPostAuxClick={noop}
                onUpvoteClick={noop}
                onDownvoteClick={noop}
                onCommentClick={noop}
                onBookmarkClick={noop}
                onCopyLinkClick={noop}
                onShare={noop}
                onReadArticleClick={noop}
              />
            ) : (
              <ArticleList
                key={post.id}
                post={post}
                onPostClick={noop}
                onPostAuxClick={noop}
                onUpvoteClick={noop}
                onDownvoteClick={noop}
                onCommentClick={noop}
                onBookmarkClick={noop}
                onCopyLinkClick={noop}
                onShare={noop}
                onReadArticleClick={noop}
              />
            ),
          )}
        </div>
      </section>
    </ActiveFeedContext.Provider>
  );
};
