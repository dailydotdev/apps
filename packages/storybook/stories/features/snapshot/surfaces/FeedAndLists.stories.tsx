import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BookmarkIcon,
  DiscussIcon,
  HotIcon,
  MenuIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  AVATAR,
  Category,
  Control,
  OverflowMenu,
  POST_MENU,
  Screen,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

const FeedCard = ({ spot }: { spot: 'menu' | 'row' | 'labeled' }) => (
  <Screen>
    <div className="flex flex-col gap-3 p-4">
      <div className="relative flex items-center gap-2">
        <img alt="" className="size-7 rounded-full object-cover" src={AVATAR} />
        <span className="min-w-0 flex-1 truncate text-text-tertiary typo-caption1">
          Watercooler · 3h
        </span>
        <Button
          aria-label="Options"
          icon={<MenuIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
        {spot === 'menu' && <OverflowMenu highlight="Share via" items={POST_MENU} />}
      </div>

      <span className="font-bold text-text-primary typo-callout">
        What is your most controversial dev opinion?
      </span>
      <div className="h-20 rounded-12 bg-surface-float" />

      <div className="flex items-center gap-1 border-t border-border-subtlest-tertiary pt-2">
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
          64
        </Button>
        <Button
          aria-label="Bookmark"
          icon={<BookmarkIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
        {spot === 'row' && <Control action="Snapshot" />}
        {spot === 'labeled' && (
          <div className="ml-auto">
            <Control action="Link" label variant={ButtonVariant.Secondary} />
          </div>
        )}
      </div>
    </div>
  </Screen>
);

const HotTakeCard = ({ spot }: { spot: 'menu' | 'row' | 'lead' }) => (
  <Screen>
    <div className="flex flex-col gap-3 p-4">
      <div className="relative flex items-center gap-2">
        <HotIcon className="text-accent-ketchup-default" />
        <span className="min-w-0 flex-1 font-bold uppercase text-accent-ketchup-default typo-caption2">
          Hot take
        </span>
        <Button
          aria-label="Options"
          icon={<MenuIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
        {spot === 'menu' && <OverflowMenu highlight="Share via" items={POST_MENU} />}
      </div>

      <p className="font-bold text-text-primary typo-callout">
        “Microservices were a mistake for most teams.”
      </p>
      <div className="flex items-center gap-2">
        <img alt="" className="size-6 rounded-full object-cover" src={AVATAR} />
        <span className="min-w-0 flex-1 truncate text-text-tertiary typo-caption1">
          Bobby Iliev · 128 agree
        </span>
        {spot === 'row' && <Control action="Snapshot" />}
        {spot === 'lead' && (
          <Control action="Snapshot" label variant={ButtonVariant.Primary} />
        )}
      </div>
    </div>
  </Screen>
);

const HistoryList = ({ spot }: { spot: 'today' | 'hover' | 'always' }) => (
  <Screen>
    <div className="flex flex-col gap-1 p-4">
      <span className="mb-2 font-bold text-text-primary typo-footnote">
        Reading history
      </span>
      {[
        'Why iconic tech brands lost their dominance',
        'The case against microservices',
        'Postgres is all you need, again',
      ].map((title, index) => (
        <div
          key={title}
          className={`flex items-center gap-3 rounded-10 px-2 py-2 ${
            index === 0 && spot === 'hover' ? 'bg-surface-float' : ''
          }`}
        >
          <div className="size-8 shrink-0 rounded-8 bg-surface-float" />
          <span className="min-w-0 flex-1 truncate text-text-primary typo-caption1">
            {title}
          </span>
          {spot === 'always' && <Control action="Link" />}
          {spot === 'hover' &&
            (index === 0 ? (
              <Control action="Link" />
            ) : (
              <span className="text-text-quaternary typo-caption1">hover</span>
            ))}
        </div>
      ))}
    </div>
  </Screen>
);

const FeedAndLists = () => (
  <SurfacePage
    intro="Everything that renders as a row in a list. The constraint is the same across all of them: the action row is already full, so anything added has to earn its width — and hover-reveal, the usual escape hatch, does not exist on touch."
    map="Sharing map: Copy link leads on feed cards and reading history — each row is just a post. Hot takes are the exception: an opinion is self-contained and quotable, so Snapshot leads there."
    title="Feed cards & lists"
  >
    <Category
      covers="Watercooler and feed cards"
      title="Feed card"
      verdict="Link leads. Snapshot rides along beside bookmark, matched to the other feed action buttons."
    >
      <Variant
        headline="Menu only"
        note="Same as any feed card — the share control is one level down."
        step="Today"
      >
        <FeedCard spot="menu" />
      </Variant>
      <Variant
        headline="Snapshot next to bookmark"
        note="Built and live. Same size and Tertiary weight as its neighbours, so the row stays even."
        step="Recommended"
      >
        <FeedCard spot="row" />
      </Variant>
      <Variant
        headline="Labeled copy link, right-aligned"
        note="Most visible option, and the most expensive: a labeled button in a feed card row competes with the upvote count for attention."
        step="Push"
      >
        <FeedCard spot="labeled" />
      </Variant>
    </Category>

    <Category
      covers="#6365 · hot take item, profile list, Hot/Cold modal"
      title="Hot takes"
      verdict="The clearest case for snapshot outside the status moments — and the lowest-risk place to test the loudest treatment."
    >
      <Variant
        headline="Buried in the item menu"
        note="The most quotable content in the product, behind the least visible control."
        step="Today"
      >
        <HotTakeCard spot="menu" />
      </Variant>
      <Variant
        headline="Snapshot on the take"
        note="Built and live. An opinion is self-contained; the image is the argument."
        step="Recommended"
      >
        <HotTakeCard spot="row" />
      </Variant>
      <Variant
        headline="Snapshot labeled and filled"
        note="Hot takes are where snapshot has the clearest right to lead, so this is where a loud treatment costs least if it fails."
        step="Push"
      >
        <HotTakeCard spot="lead" />
      </Variant>
    </Category>

    <Category
      covers="#6361 · reading history rows"
      title="Reading history"
      verdict="Each row is just a post, so the payload question never arises. Only reach does."
    >
      <Variant
        headline="Share post via… in the row menu"
        note="Verified against ReadingHistoryOptionsMenu: the row menu offers ‘Share post via…’, ‘Save to bookmarks’ and ‘Remove post’. So the action exists — it is two taps deep on a page built for re-finding things."
        step="Today"
      >
        <HistoryList spot="today" />
      </Variant>
      <Variant
        headline="Revealed on hover"
        note="Clean, conventional, and invisible to every touch user who opens this page."
        step="Recommended"
      >
        <HistoryList spot="hover" />
      </Variant>
      <Variant
        headline="Always visible"
        note="Costs a little noise on a utilitarian page and buys the entire mobile audience. On a list this plain, the noise is affordable."
        step="Push"
      >
        <HistoryList spot="always" />
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof FeedAndLists> = {
  title: 'Features/Snapshot/Surfaces/Feed cards & lists',
  component: FeedAndLists,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof FeedAndLists> = {};
