import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/Button';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Card,
  CardHeader,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from '@dailydotdev/shared/src/components/cards/common/Card';
import { Container, getGroupedHoverContainer } from '@dailydotdev/shared/src/components/cards/common/common';
import PostMetadata from '@dailydotdev/shared/src/components/cards/common/PostMetadata';
import ActionButtons from '@dailydotdev/shared/src/components/cards/common/ActionButtons';
import { ReadArticleButton } from '@dailydotdev/shared/src/components/cards/common/ReadArticleButton';
import SourceButton from '@dailydotdev/shared/src/components/cards/common/SourceButton';
import { RefreshIcon } from '@dailydotdev/shared/src/components/icons';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { ProfileImageLink } from '@dailydotdev/shared/src/components/profile/ProfileImageLink';
import { PostOptionButton } from '@dailydotdev/shared/src/features/posts/PostOptionButton';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import ExtensionProviders from '../../extension/_providers';

interface TwitterMockCardProps {
  post: Post;
  tweetUrl: string;
  repostContext?: string;
  detail?: ReactNode;
  titleLineClamp?: `line-clamp-${number}`;
  metadataPosition?: 'bottom' | 'afterTitle';
}

const HeaderActions = getGroupedHoverContainer('span');

const actionHandlers = {
  onUpvoteClick: fn(),
  onDownvoteClick: fn(),
  onCommentClick: fn(),
  onBookmarkClick: fn(),
  onCopyLinkClick: fn(),
};

const source = {
  id: 'x-source',
  handle: 'x',
  name: 'X',
  permalink: 'https://x.com',
  image: 'https://media.daily.dev/image/upload/f_auto/v1/avatars/default',
  type: 'machine' as const,
  active: true,
};

const author = {
  id: 'author-1',
  name: 'Maya Chen',
  image: 'https://media.daily.dev/image/upload/f_auto/v1/avatars/default',
  permalink: 'https://x.com/mayadev',
  username: 'mayadev',
};

const buildPost = (overrides: Partial<Post>): Post =>
  ({
    id: 'tweet-1',
    title: 'Shipped our performance pass today. Largest Contentful Paint dropped from 3.8s to 1.9s on slow 4G.',
    permalink: 'https://x.com/mayadev/status/1900000000000000001',
    commentsPermalink: 'https://x.com/mayadev/status/1900000000000000001',
    image: 'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/article-placeholder',
    createdAt: '2024-01-15T10:30:00.000Z',
    readTime: 2,
    source,
    author,
    type: PostType.Freeform,
    numUpvotes: 42,
    numComments: 12,
    numAwards: 0,
    bookmarked: false,
    read: false,
    upvoted: false,
    commented: false,
    userState: {
      vote: UserVote.None,
      flags: { feedbackDismiss: false },
    },
    tags: ['x', 'twitter'],
    ...overrides,
  }) as Post;

const TwitterMockCard = ({
  post,
  tweetUrl,
  repostContext,
  detail,
  titleLineClamp = 'line-clamp-4',
  metadataPosition = 'bottom',
}: TwitterMockCardProps): ReactElement => (
  <Card className="group min-h-card max-h-card max-w-[20rem] overflow-hidden">
    <CardTextContainer>
      <CardHeader>
        <SourceButton source={post.source ?? source} size={ProfileImageSize.Medium} />
        {!!post.author && (
          <ProfileImageLink
            picture={{ size: ProfileImageSize.Medium }}
            user={post.author}
          />
        )}
        <HeaderActions className="ml-auto flex flex-row">
          <ReadArticleButton
            className="mr-2"
            content="See tweet"
            href={tweetUrl}
            openNewTab
            variant={ButtonVariant.Primary}
          />
          <PostOptionButton post={post} />
        </HeaderActions>
      </CardHeader>

      {repostContext ? (
        <p className="mt-1 flex w-full min-w-0 items-center gap-1.5 rounded-8 border border-border-subtlest-tertiary bg-background-default px-2 py-1 text-text-tertiary typo-footnote">
          <RefreshIcon className="shrink-0" size={IconSize.Size16} />
          <span className="min-w-0 flex-1 truncate whitespace-nowrap">
            {repostContext}
          </span>
        </p>
      ) : null}

      <CardTitle lineClamp={titleLineClamp}>{post.title}</CardTitle>
    </CardTextContainer>

    <Container>
      {metadataPosition === 'bottom' ? <CardSpace /> : null}
      <PostMetadata
        className={metadataPosition === 'afterTitle' ? 'mx-4 mt-2' : 'mx-4'}
        createdAt={post.createdAt}
        readTime={post.readTime}
      />
    </Container>

    <Container>
      {detail}
      <ActionButtons
        className="mt-auto"
        onBookmarkClick={actionHandlers.onBookmarkClick}
        onCommentClick={actionHandlers.onCommentClick}
        onCopyLinkClick={actionHandlers.onCopyLinkClick}
        onDownvoteClick={actionHandlers.onDownvoteClick}
        onUpvoteClick={actionHandlers.onUpvoteClick}
        post={post}
      />
    </Container>
  </Card>
);

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}): ReactElement => (
  <section className="space-y-2 pb-2">
    <div className="space-y-1">
      <h3 className="text-text-primary typo-title3">{title}</h3>
      <p className="text-text-tertiary typo-footnote">{description}</p>
    </div>
    {children}
  </section>
);

const mediaDetail = (
  <div className="mx-1 mb-1 mt-2 h-40 overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-gradient-to-br from-accent-cabbage-default/10 to-accent-onion-default/10">
    <div className="flex h-full w-full items-center justify-center">
      <div className="rounded-8 border border-border-subtlest-tertiary bg-background-default px-2 py-1 text-text-tertiary typo-footnote">
        Mock tweet image
      </div>
    </div>
  </div>
);

const threadDetail = (
  <div className="mx-4 mb-2 mt-2 rounded-12 border border-border-subtlest-tertiary bg-background-default p-2.5">
    <div className="space-y-1.5">
      <p className="line-clamp-1 rounded-8 border border-border-subtlest-tertiary bg-background-default px-2 py-1 text-text-secondary typo-footnote">
        (1/3) Canary release with automatic rollback on error budget drain.
      </p>
      <p className="line-clamp-1 rounded-8 border border-border-subtlest-tertiary bg-background-default px-2 py-1 text-text-secondary typo-footnote">
        (2/3) Shift traffic by region and validate interaction latency.
      </p>
      <p className="line-clamp-1 rounded-8 border border-border-subtlest-tertiary bg-background-default px-2 py-1 text-text-secondary typo-footnote">
        (3/3) Keep runbooks versioned with deploy commits.
      </p>
    </div>
  </div>
);

const quoteDetail = (
  <div className="mx-4 mb-2 mt-2 rounded-12 border border-border-subtlest-tertiary p-3">
    <p className="truncate text-text-primary typo-footnote font-bold">
      DevRel Weekly
    </p>
    <p className="truncate text-text-tertiary typo-footnote">@devrelweekly</p>
    <p className="mt-1 line-clamp-2 text-text-secondary typo-footnote">
      Build core UX first, then layer richer interactions when network and
      device constraints allow.
    </p>
  </div>
);

const strictLongDetail = (
  <div className="mx-4 mb-2 mt-2 rounded-12 border border-border-subtlest-tertiary p-3">
    <p className="truncate text-text-primary typo-footnote font-bold">
      Extremely Long Account Name For Demonstration Purposes
    </p>
    <p className="truncate text-text-tertiary typo-footnote">
      @very_very_very_long_handle_name_for_stress_testing
    </p>
    <p className="mt-1 line-clamp-2 text-text-secondary typo-footnote">
      This quoted tweet is intentionally verbose to confirm readability under
      fixed-height constraints.
    </p>
  </div>
);

const smartLongDetail = (
  <div className="mx-4 mb-2 mt-2 space-y-1.5 rounded-12 border border-border-subtlest-tertiary bg-background-default p-2.5">
    <p className="line-clamp-1 rounded-8 border border-border-subtlest-tertiary bg-background-default px-2 py-1 text-text-secondary typo-footnote">
      (1/12) Gate deployment on synthetic + real-user error budgets.
    </p>
    <p className="line-clamp-1 rounded-8 border border-border-subtlest-tertiary bg-background-default px-2 py-1 text-text-secondary typo-footnote">
      (2/12) Shift traffic by region and validate p95 interaction latency.
    </p>
    <p className="rounded-8 border border-border-subtlest-tertiary px-2 py-1 text-text-tertiary typo-footnote">
      + 10 more posts hidden. View full thread.
    </p>
  </div>
);

const gridContainerStyle = {
  '--num-cards': 3,
  '--feed-gap': '2rem',
} as React.CSSProperties;

const TwitterCardsMockShowcase = (): ReactElement => (
  <ExtensionProviders>
    <div className="min-h-screen bg-background-default p-8">
      <div className="mx-auto max-w-[calc(20rem*3+2rem*2)] space-y-8">
        <header className="space-y-1">
          <h2 className="text-text-primary typo-title1">Twitter Card Mocks</h2>
          <p className="text-text-tertiary typo-callout">
            Styled against feed grid card primitives and interactions.
          </p>
        </header>

        <div
          className="grid grid-cols-3 gap-x-8 gap-y-14"
          style={{
            ...gridContainerStyle,
            maxWidth:
              'calc(20rem * var(--num-cards) + var(--feed-gap) * (var(--num-cards) - 1))',
          }}
        >
          <Section title="Normal text" description="Default tweet card.">
            <TwitterMockCard
              post={buildPost({
                id: 'tweet-normal',
                title:
                  'Shipped our performance pass today. Largest Contentful Paint dropped from 3.8s to 1.9s on slow 4G.',
              })}
              metadataPosition="afterTitle"
              tweetUrl="https://x.com/mayadev/status/1900000000000000001"
            />
          </Section>

          <Section title="Text + image" description="Tweet with media preview.">
            <TwitterMockCard
              detail={mediaDetail}
              post={buildPost({
                id: 'tweet-image',
                title:
                  'UI refresh concept for docs search. Feedback welcome on hierarchy and spacing.',
                image:
                  'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/article-placeholder',
              })}
              tweetUrl="https://x.com/nategross/status/1900000000000000002"
            />
          </Section>

          <Section
            title="Retweet / repost"
            description="Repost context inside body."
          >
            <TwitterMockCard
              detail={quoteDetail}
              post={buildPost({
                id: 'tweet-repost',
                title:
                  'Strong point on optimizing interaction latency, not only page load metrics.',
              })}
              repostContext="Reposted by Elena Park"
              tweetUrl="https://x.com/jonahm/status/1900000000000000003"
            />
          </Section>

          <Section
            title="Thread"
            description="Single card with compact thread preview."
          >
            <TwitterMockCard
              detail={threadDetail}
              post={buildPost({
                id: 'tweet-thread',
                title:
                  'Thread: 3 deployment practices that reduced our rollback rate last quarter.',
              })}
              tweetUrl="https://x.com/saraibrahim/status/1900000000000000004"
            />
          </Section>

          <Section
            title="Long text (strict truncation)"
            description="Clamp aggressively to keep layout stable."
          >
            <TwitterMockCard
              detail={strictLongDetail}
              post={buildPost({
                id: 'tweet-long-strict',
                title:
                  'We rewrote our rendering pipeline and now track scheduler starvation, hydration gaps, and interaction latency budgets in one dashboard. The unexpected finding: tiny synchronous work in edge handlers created most regressions.',
                author: {
                  ...author,
                  name: 'Alexandria Catherine-Montgomery the Third',
                  username: 'very_long_engineering_handle_that_keeps_going',
                },
              })}
              repostContext="Reposted from the distributed-systems-performance working group weekly digest"
              tweetUrl="https://x.com/very_long_engineering_handle_that_keeps_going/status/1900000000000000007"
            />
          </Section>

          <Section
            title="Long text (smart collapse)"
            description="Show summary and hide deep thread entries."
          >
            <TwitterMockCard
              detail={smartLongDetail}
              post={buildPost({
                id: 'tweet-long-smart',
                title:
                  'Thread summary: rollout checklist for high-risk infra deploys across multiple regions, providers, and compliance boundaries.',
                author: {
                  ...author,
                  name: 'Platform Reliability Guild',
                  username: 'platform_reliability_global_updates',
                },
              })}
              tweetUrl="https://x.com/platform_reliability_global_updates/status/1900000000000000008"
            />
          </Section>
        </div>
      </div>
    </div>
  </ExtensionProviders>
);

const meta: Meta<typeof TwitterCardsMockShowcase> = {
  title: 'Components/Cards/Social/TwitterCardMocks',
  component: TwitterCardsMockShowcase,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof TwitterCardsMockShowcase>;

export const AllVariants: Story = {};
