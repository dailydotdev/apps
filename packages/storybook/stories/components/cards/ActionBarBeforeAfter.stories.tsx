import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import ActionButtons from '@dailydotdev/shared/src/components/cards/common/ActionButtons';
import InteractionCounter from '@dailydotdev/shared/src/components/InteractionCounter';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import { CardAction } from '@dailydotdev/shared/src/components/buttons/CardAction';
import { CardActionBar } from '@dailydotdev/shared/src/components/buttons/CardActionBar';
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ButtonColor as ButtonColorV2 } from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  AnalyticsIcon,
  BookmarkIcon,
  DiscussIcon,
  DownvoteIcon,
  LinkIcon,
  MedalBadgeIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import ExtensionProviders from '../../extension/_providers';
import { FeatureOverrides } from '../../../mock/GrowthBookProvider';

const post = {
  id: 'article-1',
  title: 'Cloud Run now scales to zero',
  permalink: 'https://api.daily.dev/r/article-1',
  commentsPermalink: 'https://daily.dev/posts/article-1',
  createdAt: '2024-01-15T10:30:00.000Z',
  readTime: 8,
  type: PostType.Article,
  numUpvotes: 200,
  numComments: 80,
  numAwards: 99,
  analytics: { impressions: 234500 },
  userState: { vote: UserVote.None, flags: { feedbackDismiss: false } },
  author: { id: 'u1', name: 'Dev Dana', username: 'devdana' },
  source: {
    id: 'tds',
    handle: 'tds',
    name: 'Towards Data Science',
    permalink: 'https://app.daily.dev/sources/tds',
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
    type: 'machine' as const,
    active: true,
  },
} as unknown as Post;

const impressionsOn = {
  card_impressions: true,
  engagement_bar_v2: false,
  feed_card_glass_actions: false,
};
const impressionsOnV2 = { ...impressionsOn, engagement_bar_v2: true };
const control = { ...impressionsOn, card_impressions: false };
const controlV2 = { ...impressionsOnV2, card_impressions: false };

/**
 * The v1 bar exactly as it stands on `main`: Small buttons, XSmall icons,
 * `px-1 pb-1`, `!pl-[1px]` counters, and the award action hardcoded to Small.
 * Kept as plain markup so the comparison survives future edits to the real one.
 */
const MainV1Bar = ({ withAward }: { withAward: boolean }) => (
  <div className="flex flex-row items-center justify-between px-1 pb-1">
    <div className="flex flex-1 items-center justify-between">
      <QuaternaryButton
        labelClassName="!pl-[1px]"
        className="btn-tertiary-avocado"
        color={ButtonColor.Avocado}
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<UpvoteIcon size={IconSize.XSmall} />}
      >
        <InteractionCounter
          className="tabular-nums typo-footnote"
          value={200}
        />
      </QuaternaryButton>
      <QuaternaryButton
        labelClassName="!pl-[1px]"
        className="btn-tertiary-blueCheese"
        size={ButtonSize.Small}
        icon={<DiscussIcon size={IconSize.XSmall} />}
      >
        <InteractionCounter className="tabular-nums typo-footnote" value={80} />
      </QuaternaryButton>
      <QuaternaryButton
        color={ButtonColor.Ketchup}
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<DownvoteIcon size={IconSize.XSmall} />}
      />
      {withAward && (
        <QuaternaryButton
          className="btn-tertiary-cabbage"
          color={ButtonColor.Cabbage}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          labelClassName="!pl-[1px]"
          icon={<MedalBadgeIcon secondary size={IconSize.XSmall} />}
        >
          <InteractionCounter
            className="tabular-nums !typo-footnote"
            value={99}
          />
        </QuaternaryButton>
      )}
      <QuaternaryButton
        className="btn-tertiary-bun"
        color={ButtonColor.Bun}
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<BookmarkIcon size={IconSize.XSmall} />}
      />
      <QuaternaryButton
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        color={ButtonColor.Cabbage}
        icon={<LinkIcon size={IconSize.XSmall} />}
      />
      {!withAward && (
        <QuaternaryButton
          labelClassName="!pl-[1px]"
          className="btn-tertiary-cheese"
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Cheese}
          icon={<AnalyticsIcon size={IconSize.XSmall} />}
        >
          <InteractionCounter
            className="tabular-nums typo-footnote"
            value={234500}
          />
        </QuaternaryButton>
      )}
    </div>
  </div>
);

/** The v2 bar on `main`: compact density plus the `gap-1` on the feed row. */
const MainV2Bar = ({ withAward }: { withAward: boolean }) => (
  <div className="flex flex-row items-center justify-between px-1 pb-1">
    <CardActionBar layout="feedCard" className="gap-1">
      <CardAction
        density="compact"
        color={ButtonColorV2.Avocado}
        icon={<UpvoteIcon />}
        label="Upvote"
        count={200}
      />
      <CardAction
        density="compact"
        icon={<DiscussIcon />}
        label="Comments"
        count={80}
      />
      <CardAction
        density="compact"
        color={ButtonColorV2.Ketchup}
        icon={<DownvoteIcon />}
        label="Downvote"
      />
      {withAward && (
        <CardAction
          density="compact"
          color={ButtonColorV2.Cabbage}
          icon={<MedalBadgeIcon />}
          label="Award"
          count={99}
        />
      )}
      <CardAction
        density="compact"
        color={ButtonColorV2.Bun}
        icon={<BookmarkIcon />}
        label="Bookmark"
      />
      <CardAction
        density="compact"
        color={ButtonColorV2.Cabbage}
        icon={<LinkIcon />}
        label="Copy link"
      />
      {!withAward && (
        <CardAction
          density="compact"
          color={ButtonColorV2.Cheese}
          icon={<AnalyticsIcon />}
          label="Impressions"
          count={234500}
        />
      )}
    </CardActionBar>
  </div>
);

const CardFrame = ({
  width,
  children,
}: {
  width: number;
  children: React.ReactNode;
}) => (
  <div
    style={{ width }}
    className="overflow-visible rounded-16 border border-border-subtlest-tertiary bg-surface-float"
  >
    <div className="h-20" />
    {children}
  </div>
);

const Pair = ({
  title,
  note,
  width,
  before,
  values,
}: {
  title: string;
  note: string;
  width: number;
  before: React.ReactNode;
  values: Record<string, unknown>;
}) => (
  <section className="mb-12">
    <h3 className="text-base font-bold text-text-primary">{title}</h3>
    <p className="mb-4 max-w-2xl text-sm text-text-tertiary">{note}</p>
    <div className="flex flex-wrap gap-10">
      <div>
        <p className="mb-2 text-xs font-bold text-accent-ketchup-default">
          Before — main
        </p>
        <CardFrame width={width}>{before}</CardFrame>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold text-accent-avocado-default">
          After — this PR
        </p>
        <CardFrame width={width}>
          <FeatureOverrides values={values}>
            <ActionButtons
              post={post}
              variant="grid"
              onUpvoteClick={fn()}
              onCommentClick={fn()}
              onBookmarkClick={fn()}
              onCopyLinkClick={fn()}
              onDownvoteClick={fn()}
            />
          </FeatureOverrides>
        </CardFrame>
      </div>
    </div>
  </section>
);

const ActionBarBeforeAfter = () => (
  <ExtensionProviders>
    <div className="min-h-screen bg-background-default p-8">
      <h2 className="mb-2 text-2xl font-bold text-text-primary">
        Default card action bar — before / after
      </h2>
      <p className="mb-8 max-w-3xl text-sm text-text-tertiary">
        Only the default bar is shown: the floating glass pill already used
        these sizes and has never carried an award action, so this PR does not
        change it. Every card here holds the same post — 200 upvotes, 80
        comments, 99 awards, 234.5K impressions.
      </p>

      <Pair
        title="1. Impressions on, 320px"
        note="Award action dropped, and the impressions number moves from 5px off the card edge to 13px. Buttons go 32px → 24px, icons 20px → 16px, and the row keeps its 36px height."
        width={320}
        values={impressionsOn}
        before={<MainV1Bar withAward={false} />}
      />

      <Pair
        title="2. Impressions on, 272px min card width"
        note="At the narrowest grid track the number did not just crowd the edge, it crossed it: on main it sits 6px outside the card. It now ends 13px inside."
        width={272}
        values={impressionsOn}
        before={<MainV1Bar withAward={false} />}
      />

      <Pair
        title="3. Control — card_impressions off, 272px"
        note="The award action still renders here, so this is the widest layout. Main is uniformly 32px; this PR is uniformly 24px. The award button is the one that had to be threaded through — it hardcoded its own size, which a review caught before merge."
        width={272}
        values={control}
        before={<MainV1Bar withAward />}
      />

      <Pair
        title="4. Engagement bar v2, impressions on, 272px"
        note="On main this row needed more width than the card had, so the trailing action hung outside the rounded corner. The tight density and the removed row gap bring it back inside."
        width={272}
        values={impressionsOnV2}
        before={<MainV2Bar withAward={false} />}
      />

      <Pair
        title="5. Engagement bar v2, control, 272px"
        note="Same row with the award action instead of impressions."
        width={272}
        values={controlV2}
        before={<MainV2Bar withAward />}
      />
    </div>
  </ExtensionProviders>
);

const meta: Meta<typeof ActionBarBeforeAfter> = {
  title: 'Components/Cards/ActionBarBeforeAfter',
  component: ActionBarBeforeAfter,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Default: StoryObj<typeof ActionBarBeforeAfter> = {};
