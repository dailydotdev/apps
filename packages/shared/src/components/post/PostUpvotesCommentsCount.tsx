import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { POST_REPOSTS_BY_ID_QUERY, type Post } from '../../graphql/posts';
import { ClickableText } from '../buttons/ClickableText';
import { largeNumberFormat } from '../../lib';
import { Image } from '../image/Image';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
import Link from '../utilities/Link';
import { webappUrl } from '../../lib/constants';
import { getPostImpressions } from '../../lib/impressions';

const DEFAULT_REPOSTS_PER_PAGE = 20;

type PostUpvotesCommentsCountPost = Pick<
  Post,
  | 'analytics'
  | 'numAwards'
  | 'numComments'
  | 'numReposts'
  | 'numUpvotes'
  | 'views'
> &
  Partial<Pick<Post, 'id'>> & {
    author?: Pick<NonNullable<Post['author']>, 'id'>;
    featuredAward?: {
      award?: Pick<
        NonNullable<NonNullable<Post['featuredAward']>['award']>,
        'image' | 'name'
      >;
    };
  };

interface PostUpvotesCommentsCountProps {
  post: PostUpvotesCommentsCountPost;
  onUpvotesClick?: (upvotes: number) => unknown;
  onCommentsClick?: () => unknown;
  className?: string;
  compact?: boolean;
  passive?: boolean;
}

type PostUpvotesCommentsCountContentProps = PostUpvotesCommentsCountProps & {
  onRepostsClick?: () => unknown;
  onAwardsClick?: () => unknown;
};

const PostUpvotesCommentsCountContent = ({
  post,
  onUpvotesClick,
  onCommentsClick,
  onRepostsClick,
  onAwardsClick,
  className,
  compact = false,
  passive = false,
}: PostUpvotesCommentsCountContentProps): ReactElement => {
  const upvotes = post.numUpvotes || 0;
  const comments = post.numComments || 0;
  const awards = post.numAwards || 0;
  const reposts = post.numReposts || 0;
  const getText = ({ count, label }: { count: number; label: string }) =>
    `${largeNumberFormat(count)} ${label}${count > 1 ? 's' : ''}`;

  const renderText = ({
    key,
    onClick,
    children,
  }: {
    key: string;
    onClick?: () => unknown;
    children: ReactElement | string;
  }) => {
    if (passive || !onClick) {
      return <span key={key}>{children}</span>;
    }

    return (
      <ClickableText key={key} onClick={onClick}>
        {children}
      </ClickableText>
    );
  };

  return (
    <div
      className={classNames(
        'flex flex-wrap items-center text-text-tertiary',
        compact
          ? 'mb-0 gap-x-3 gap-y-1 !leading-5 typo-caption1'
          : 'mb-3 gap-x-4 !leading-7 typo-callout',
        className,
      )}
      data-testid="statsBar"
    >
      {upvotes > 0 &&
        renderText({
          key: 'upvotes',
          onClick: () => onUpvotesClick?.(upvotes),
          children: getText({ count: upvotes, label: 'Upvote' }),
        })}
      {comments > 0 &&
        renderText({
          key: 'comments',
          onClick: onCommentsClick,
          children: getText({ count: comments, label: 'Comment' }),
        })}
      {/* Impressions sit right after comments and look like the other stats;
          tapping them opens the analytics page (replacing the old blue "Post
          analytics" button). Shown on the post page/modal strip (not the
          compact embed). Uses the shared impressions helper so it stays visible
          via the mock fallback until the API populates real `views`. */}
      {!compact &&
        post.id &&
        (() => {
          const impressions = getPostImpressions({
            id: post.id,
            views: post.views,
            analytics: post.analytics,
          });
          const label = getText({ count: impressions, label: 'Impression' });
          return !passive ? (
            <Link
              key="impressions"
              href={`${webappUrl}posts/${post.id}/analytics`}
              passHref
            >
              <ClickableText tag="a" textClassName="text-text-tertiary">
                {label}
              </ClickableText>
            </Link>
          ) : (
            <span key="impressions">{label}</span>
          );
        })()}
      {reposts > 0 &&
        renderText({
          key: 'reposts',
          onClick: onRepostsClick,
          children: getText({ count: reposts, label: 'Repost' }),
        })}
      {awards > 0 &&
        renderText({
          key: 'awards',
          onClick: onAwardsClick,
          children: (
            <span className="flex items-center gap-1">
              {!!post.featuredAward?.award && (
                <Image
                  src={post.featuredAward.award.image}
                  alt={post.featuredAward.award.name}
                  className={compact ? 'size-4' : 'size-6'}
                />
              )}
              {largeNumberFormat(awards)}
              {` Award${awards === 1 ? '' : 's'}`}
            </span>
          ),
        })}
    </div>
  );
};

const InteractivePostUpvotesCommentsCount = ({
  post,
  onUpvotesClick,
  onCommentsClick,
  className,
  compact,
}: PostUpvotesCommentsCountProps): ReactElement => {
  const { openModal } = useLazyModal();
  const awards = post.numAwards || 0;
  const hasAccessToCores = useHasAccessToCores();
  if (!post.id) {
    return (
      <PostUpvotesCommentsCountContent
        post={post}
        onUpvotesClick={onUpvotesClick}
        onCommentsClick={onCommentsClick}
        className={className}
        compact={compact}
      />
    );
  }
  const postId = post.id;

  const onRepostsClick = () =>
    openModal({
      type: LazyModal.RepostsPopup,
      props: {
        requestQuery: {
          queryKey: ['postReposts', postId],
          query: POST_REPOSTS_BY_ID_QUERY,
          params: {
            id: postId,
            first: DEFAULT_REPOSTS_PER_PAGE,
            supportedTypes: ['share'],
          },
        },
      },
    });

  return (
    <PostUpvotesCommentsCountContent
      post={post}
      onUpvotesClick={onUpvotesClick}
      onCommentsClick={onCommentsClick}
      onRepostsClick={onRepostsClick}
      onAwardsClick={
        hasAccessToCores && awards > 0
          ? () => {
              openModal({
                type: LazyModal.ListAwards,
                props: {
                  queryProps: {
                    id: postId,
                    type: 'POST',
                  },
                },
              });
            }
          : undefined
      }
      className={className}
      compact={compact}
    />
  );
};

export function PostUpvotesCommentsCount({
  passive,
  ...props
}: PostUpvotesCommentsCountProps): ReactElement {
  if (passive) {
    return <PostUpvotesCommentsCountContent passive={passive} {...props} />;
  }

  return <InteractivePostUpvotesCommentsCount {...props} />;
}
