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
import { canViewPostAnalytics } from '../../lib/user';
import { useAuthContext } from '../../contexts/AuthContext';
import Link from '../utilities/Link';
import { Button, ButtonSize } from '../buttons/Button';
import { AnalyticsIcon } from '../icons';
import { webappUrl } from '../../lib/constants';

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
  className?: string;
  compact?: boolean;
  passive?: boolean;
}

type PostUpvotesCommentsCountContentProps = PostUpvotesCommentsCountProps & {
  onRepostsClick?: () => unknown;
  onAwardsClick?: () => unknown;
  showPostAnalytics?: boolean;
};

const PostUpvotesCommentsCountContent = ({
  post,
  onUpvotesClick,
  onRepostsClick,
  onAwardsClick,
  showPostAnalytics = false,
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
      <ClickableText
        key={key}
        onClick={onClick}
        defaultTypo={false}
        className="!text-text-secondary"
      >
        {children}
      </ClickableText>
    );
  };

  return (
    <div
      className={classNames(
        'flex flex-wrap items-center font-medium text-text-secondary',
        compact
          ? 'mb-0 gap-x-3 gap-y-1 typo-caption1'
          : 'mb-3 gap-x-4 gap-y-1 typo-footnote',
        className,
      )}
      data-testid="statsBar"
    >
      {!!post.analytics?.impressions && (
        <span>
          {getText({ count: post.analytics.impressions, label: 'Impression' })}
        </span>
      )}
      {upvotes > 0 &&
        renderText({
          key: 'upvotes',
          onClick: () => onUpvotesClick?.(upvotes),
          children: getText({ count: upvotes, label: 'Upvote' }),
        })}
      {comments > 0 && (
        <span>
          {largeNumberFormat(comments)}
          {` Comment${comments === 1 ? '' : 's'}`}
        </span>
      )}
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
      {showPostAnalytics && (
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
  className,
  compact,
}: PostUpvotesCommentsCountProps): ReactElement => {
  const { openModal } = useLazyModal();
  const { user } = useAuthContext();
  const awards = post.numAwards || 0;
  const hasAccessToCores = useHasAccessToCores();
  if (!post.id) {
    return (
      <PostUpvotesCommentsCountContent
        post={post}
        onUpvotesClick={onUpvotesClick}
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
      showPostAnalytics={canViewPostAnalytics({ user, post })}
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
