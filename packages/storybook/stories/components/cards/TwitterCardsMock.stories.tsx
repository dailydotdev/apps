import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Card,
  CardHeader,
  CardTextContainer,
  CardTitle,
} from '@dailydotdev/shared/src/components/cards/common/Card';
import { Container, getGroupedHoverContainer } from '@dailydotdev/shared/src/components/cards/common/common';
import PostMetadata from '@dailydotdev/shared/src/components/cards/common/PostMetadata';
import ActionButtons from '@dailydotdev/shared/src/components/cards/common/ActionButtons';
import SourceButton from '@dailydotdev/shared/src/components/cards/common/SourceButton';
import { TwitterIcon } from '@dailydotdev/shared/src/components/icons';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { ProfileImageLink } from '@dailydotdev/shared/src/components/profile/ProfileImageLink';
import { PostOptionButton } from '@dailydotdev/shared/src/features/posts/PostOptionButton';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import ExtensionProviders from '../../extension/_providers';

interface TwitterMockCardProps {
  post: Post;
  tweetUrl: string;
  body?: ReactNode;
  detail?: ReactNode;
  titleLineClamp?: `line-clamp-${number}`;
  showEmptyPlaceholder?: boolean;
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
  body,
  detail,
  titleLineClamp = 'line-clamp-4',
  showEmptyPlaceholder = false,
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
        <div className="ml-auto relative flex min-h-8 min-w-[4.5rem] items-center justify-end">
          <HeaderActions className="absolute inset-y-0 right-0 flex flex-row items-center justify-end">
            <Button
              className="mr-2"
              icon={<TwitterIcon size={IconSize.Size16} />}
              size={ButtonSize.Small}
              tag="a"
              href={tweetUrl}
              rel="noopener noreferrer"
              target="_blank"
              variant={ButtonVariant.Primary}
            />
            <PostOptionButton post={post} />
          </HeaderActions>
        </div>
      </CardHeader>

      <CardTitle lineClamp={titleLineClamp}>{post.title}</CardTitle>
    </CardTextContainer>

    <PostMetadata
      className="mx-4 mt-1 line-clamp-1 break-words"
      createdAt={post.createdAt}
      readTime={post.readTime}
    />

    <Container>
      {body ? (
        <p className="mx-4 mt-1 line-clamp-6 whitespace-pre-line break-words text-text-primary typo-callout">
          {body}
        </p>
      ) : null}
      <div className={'flex flex-1'}></div>
      {detail}
      {!detail && showEmptyPlaceholder ? (
        <div className="mx-1 mb-1 mt-2 h-40" />
      ) : null}
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

const repostDetail = (
  <div className="mx-1 mb-1 mt-2 h-40 rounded-12 border border-border-subtlest-tertiary p-3">
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

const smartLongDetail = (
  <div className="mx-4 mb-2 mt-1">
    <p className="text-text-tertiary typo-footnote">
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
              detail={mediaDetail}
              post={buildPost({
                id: 'tweet-normal',
                title:
                  'Shipped our performance pass today. Largest Contentful Paint dropped from 3.8s to 1.9s on slow 4G.',
              })}
              showEmptyPlaceholder
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
            description="Repost variant with quoted original tweet."
          >
            <TwitterMockCard
              detail={repostDetail}
              post={buildPost({
                id: 'tweet-repost',
                title:
                  'Strong point on optimizing interaction latency, not only page load metrics.',
              })}
              tweetUrl="https://x.com/jonahm/status/1900000000000000003"
            />
          </Section>

          <Section
            title="Thread"
            description="Freeform style: main tweet as title, body as thread."
          >
            <TwitterMockCard
              post={buildPost({
                id: 'tweet-thread',
                title: '3 deployment practices that reduced rollbacks',
              })}
              body={`(1/3) Canary release with automatic rollback on error budget drain.\n(2/3) Shift traffic by region and validate interaction latency.\n(3/3) Keep runbooks versioned with deploy commits.`}
              showEmptyPlaceholder
              tweetUrl="https://x.com/saraibrahim/status/1900000000000000004"
            />
          </Section>

          <Section
            title="Long text (strict truncation)"
            description="Clamp aggressively to keep layout stable."
          >
            <TwitterMockCard
              post={buildPost({
                id: 'tweet-long-strict',
                title:
                  'We now track scheduler starvation, hydration gaps, and interaction latency budgets in one dashboard. Tiny synchronous work in edge handlers created most regressions.',
                author: {
                  ...author,
                  name: 'Alexandria Catherine-Montgomery the Third',
                  username: 'very_long_engineering_handle_that_keeps_going',
                },
              })}
              detail={
                <div className="mx-1 mb-1 mt-2 h-40 rounded-12 border border-border-subtlest-tertiary p-3">
                  <p className="truncate text-text-primary typo-footnote font-bold">
                    Extremely Long Account Name For Demonstration Purposes
                  </p>
                  <p className="truncate text-text-tertiary typo-footnote">
                    @very_very_very_long_handle_name_for_stress_testing
                  </p>
                  <p className="mt-1 line-clamp-5 text-text-secondary typo-footnote">
                    This quoted tweet is intentionally verbose to confirm readability under
                    fixed-height constraints. This quoted tweet is intentionally verbose to confirm readability under
                    fixed-height constraints. This quoted tweet is intentionally verbose to confirm readability under
                    fixed-height constraints.
                  </p>
                </div>
              }
              tweetUrl="https://x.com/very_long_engineering_handle_that_keeps_going/status/1900000000000000007"
            />
          </Section>

          <Section
            title="Long text (smart collapse)"
            description="Show summary and hide deep thread entries."
          >
            <TwitterMockCard
              post={buildPost({
                id: 'tweet-long-smart',
                title: 'Rollout checklist for high-risk infra deploys',
                author: {
                  ...author,
                  name: 'Platform Reliability Guild',
                  username: 'platform_reliability_global_updates',
                },
              })}
              body={`(1/12) Gate deployment on synthetic + real-user error budgets.\n(2/12) Shift traffic by region and validate p95 interaction latency.\n(3/12) Validate rollback pathways for partial-region incidents.`}
              showEmptyPlaceholder
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
