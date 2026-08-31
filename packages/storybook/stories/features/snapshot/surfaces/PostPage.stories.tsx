import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BookmarkIcon,
  CopyIcon,
  DiscussIcon,
  LinkIcon,
  MenuIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  AVATAR,
  Category,
  Control,
  OverflowMenu,
  Screen,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

type Spot =
  | 'menu'
  | 'actionbar'
  | 'tldr'
  | 'selection'
  | 'endband'
  | 'upvote';

const TITLE = 'Why iconic tech brands lost their dominance';

const TLDR =
  'Nokia, BlackBerry and Kodak all led their categories and all missed the same turn: they optimised the product they had instead of the one their customers were moving to.';

const SourceRow = ({ menu }: { menu?: boolean }) => (
  <div className="relative flex items-center gap-3">
    <img alt="" className="size-8 rounded-full object-cover" src={AVATAR} />
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-bold text-text-primary typo-footnote">
        XDA Developers
      </span>
      <span className="text-text-quaternary typo-caption1">
        4h · 4 min read
      </span>
    </div>
    <Button
      aria-label="Options"
      icon={<MenuIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    {menu && <OverflowMenu action="Link" />}
  </div>
);

const Tldr = ({ trailing }: { trailing?: React.ReactNode }) => (
  <div className="flex flex-col gap-2 rounded-12 bg-surface-float p-3">
    <span className="font-bold uppercase text-text-quaternary typo-caption2">
      TLDR
    </span>
    <p className="text-text-secondary typo-footnote">{TLDR}</p>
    <div className="flex items-center gap-3">
      <span className="font-bold text-text-link typo-footnote">Show more</span>
      {trailing}
    </div>
  </div>
);

const ActionBar = ({ trailing }: { trailing?: React.ReactNode }) => (
  <div className="flex items-center gap-1 border-t border-border-subtlest-tertiary pt-3">
    <Button
      icon={<UpvoteIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    >
      128
    </Button>
    <Button
      icon={<DiscussIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    >
      24
    </Button>
    <Button
      aria-label="Bookmark"
      icon={<BookmarkIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    <div className="ml-auto">{trailing}</div>
  </div>
);

const Body = ({ highlighted }: { highlighted?: boolean }) => (
  <p className="text-text-secondary typo-footnote">
    The pattern repeats across decades.{' '}
    <span
      className={
        highlighted
          ? 'rounded-4 bg-overlay-float-cabbage text-text-primary'
          : undefined
      }
    >
      Every one of them optimised the product they had instead of the one their
      customers were moving to.
    </span>{' '}
    By the time the shift was undeniable, the org chart was built around the old
    answer.
  </p>
);

const SelectionBar = () => (
  <div
    aria-label="Share selected text"
    className="inline-flex items-center gap-1 self-start rounded-12 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2"
    role="toolbar"
  >
    <Button
      aria-label="Copy link"
      icon={<LinkIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    <Button
      aria-label="Copy text"
      icon={<CopyIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    <Button
      aria-label="Quote in a comment"
      icon={<DiscussIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    <Control action="Snapshot" />
  </div>
);

const Comment = () => (
  <div className="flex gap-3">
    <img alt="" className="size-8 rounded-full object-cover" src={AVATAR} />
    <div className="flex flex-col gap-1">
      <span className="font-bold text-text-primary typo-caption1">
        Bobby Iliev
      </span>
      <span className="text-text-tertiary typo-caption1">
        The org chart point is the whole article, honestly.
      </span>
    </div>
  </div>
);

const PostScreen = ({ spot }: { spot: Spot }) => (
  <Screen>
    <div className="flex flex-col gap-3 p-4">
      <SourceRow menu={spot === 'menu'} />
      <h3 className="font-bold text-text-primary typo-title3">{TITLE}</h3>
      <div className="h-24 rounded-12 bg-surface-float" />

      <Tldr
        trailing={
          spot === 'tldr' ? (
            <Control action="Snapshot" label variant={ButtonVariant.Float} />
          ) : undefined
        }
      />

      <Body highlighted={spot === 'selection'} />
      {spot === 'selection' && <SelectionBar />}

      <ActionBar
        trailing={
          spot === 'actionbar' ? (
            <Control action="Link" label variant={ButtonVariant.Secondary} />
          ) : (
            <Button
              aria-label="Share"
              icon={<LinkIcon />}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
            />
          )
        }
      />

      {spot === 'upvote' && (
        <div className="flex items-center gap-3 rounded-12 border border-accent-cabbage-default bg-overlay-float-cabbage p-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold text-text-primary typo-footnote">
              Should anyone else see this?
            </span>
            <span className="text-text-tertiary typo-caption1">
              You upvoted it — pass it on
            </span>
          </div>
          <Control action="Link" label variant={ButtonVariant.Primary} />
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-3">
        <span className="font-bold text-text-primary typo-footnote">
          24 comments
        </span>
        <Comment />
      </div>

      {spot === 'endband' && (
        <div className="flex items-center gap-3 rounded-12 bg-surface-float p-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold text-text-primary typo-footnote">
              Enjoyed this discussion?
            </span>
            <span className="text-text-tertiary typo-caption1">
              24 comments and counting
            </span>
          </div>
          <Control action="Snapshot" />
          <Control action="Link" label variant={ButtonVariant.Secondary} />
        </div>
      )}
    </div>
  </Screen>
);

const PostPage = () => (
  <SurfacePage
    intro="One screen, six places a share control could live on it. The post page is our highest-traffic surface by an order of magnitude — 1.38m views in 30 days — so it is also where a percentage point of share rate is worth the most."
    map="Sharing map: lead with Copy link (#6350, #6352, #6349, #6351). The destination is the value here — people want to read the article, not look at a picture of it. Snapshot earns its place on the quote and the summary, which stand alone."
    title="Post page & modal"
  >
    <Category
      covers="#6350 · post page and modal"
      title="The post itself"
      verdict="Copy link leads. The only question is how visible it is."
    >
      <Variant
        headline="Buried in the ⋯ menu"
        note="Two taps, and a scan past three moderation actions before sharing is even an option."
        step="Today"
      >
        <PostScreen spot="menu" />
      </Variant>
      <Variant
        headline="Labeled, at the end of the action row"
        note="The row is already where people press. A label makes it readable at a glance instead of one more grey glyph."
        step="Recommended"
      >
        <PostScreen spot="actionbar" />
      </Variant>
      <Variant
        headline="Snapshot under the TLDR"
        note="Built and live. The summary is a self-contained payload, so it is the one place on the post page where an image beats a link."
        step="Also"
      >
        <PostScreen spot="tldr" />
      </Variant>
    </Category>

    <Category
      covers="#6352 · text selection · #6349 · end of conversation · #6351 · post-upvote"
      title="The moments inside the post"
      verdict="Three moments where intent spikes and the control can appear on its own rather than waiting to be found."
    >
      <Variant
        headline="Floating bar on selected text"
        note="Snapshot leads here: the quote is the share and the link is only attribution. The bar appears exactly when intent exists."
        step="Selection"
      >
        <PostScreen spot="selection" />
      </Variant>
      <Variant
        headline="Band under the last comment"
        note="Peak-end. The band sits where reading actually stops, with snapshot beside it for anyone who wants the thread as an image."
        step="End of thread"
      >
        <PostScreen spot="endband" />
      </Variant>
      <Variant
        headline="Prompt after an upvote"
        note="The strongest intent signal we get. Snapshot stays out — it would be the same payload twice."
        step="After upvote"
      >
        <PostScreen spot="upvote" />
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof PostPage> = {
  title: 'Features/Snapshot/Surfaces/Post page',
  component: PostPage,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof PostPage> = {};
