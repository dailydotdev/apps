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
import { Button, ButtonSize } from '../buttons/Button';
import { AnalyticsIcon } from '../icons';
import { webappUrl } from '../../lib/constants';
import { usePostImpressions } from '../../hooks/post/usePostImpressions';

const DEFAULT_REPOSTS_PER_PAGE = 20;

type PostUpvotesCommentsCountPost = Pick<
  Post,
  'analytics' | 'numAwards' | 'numComments' | 'numReposts' | 'numUpvotes'
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
  onImpressionsClick?: () => void;
  showPostAnalytics?: boolean;
  showImpressionsStat?: boolean;
};

const PostUpvotesCommentsCountContent = ({
  post,
  onUpvotesClick,
  onCommentsClick,
  onRepostsClick,
  onAwardsClick,
  onImpressionsClick,
  showPostAnalytics = false,
  showImpressionsStat = false,
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
  const impressions = post.analytics?.impressions ?? 0;

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
      {/* Control: the count stays author/team-only. The API returns
          `analytics.impressions` to every viewer, anonymous ones included, so
          the gate has to be the viewer, not the presence of the number. */}
      {!showImpressionsStat && showPostAnalytics && impressions > 0 && (
        <span>{getText({ count: impressions, label: 'Impression' })}</span>
      )}
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
      {/* Flag on: impressions sit right after comments and look like the other
          stats. Tapping routes the owner/team to the analytics page and
          everyone else to the explainer popup (same handler as the feed cards).
          Shown on the post page/modal strip only (not the compact embed). */}
      {showImpressionsStat &&
        renderText({
          key: 'impressions',
          onClick: onImpressionsClick,
          children: getText({ count: impressions, label: 'Impression' }),
        })}
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
      {/* With the flag on, the impressions stat doubles as the analytics link,
          but it only renders when the post has impression data — keep the
          button as the fallback entry point so authors/team never lose the
          direct link to analytics. */}
      {showPostAnalytics && !showImpressionsStat && (
        <Link href={`${webappUrl}posts/${post.id}/analytics`} passHref>
          <Button
            tag="a"
            size={ButtonSize.XSmall}
            className="font-normal text-text-link"
            icon={<AnalyticsIcon />}
          >
            Post analytics
          </Button>
        </Link>
      )}
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
  // Where the stat can render at all. It doubles as the enrolment condition:
  // a compact embed or an impression-less post looks identical in both arms,
  // so exposing those viewers would only dilute the experiment.
  const canShowImpressions =
    !compact && !!post.id && (post.analytics?.impressions ?? 0) > 0;
  const { showImpressions, canViewAnalytics, onImpressionsClick } =
    usePostImpressions(post, { shouldEvaluate: canShowImpressions });
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
      showPostAnalytics={canViewAnalytics}
      showImpressionsStat={canShowImpressions && showImpressions}
      onImpressionsClick={onImpressionsClick}
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
