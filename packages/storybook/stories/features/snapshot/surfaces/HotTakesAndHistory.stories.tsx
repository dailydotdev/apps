import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  DownvoteIcon,
  HotIcon,
  MenuIcon,
  MiniCloseIcon,
  ReputationIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { DeviceName } from '../surfaceChrome';
import {
  AVATAR,
  Category,
  Control,
  Device,
  OverflowMenu,
  Rail,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

/** What ships today, against the placement this page argues for. */
type Placement = 'today' | 'chosen';

type ScreenProps = { device: DeviceName; placement: Placement };

const DEVICE_ORDER: DeviceName[] = ['Desktop', 'Tablet', 'Mobile'];

const Rails = ({
  screen: Screen,
  placement,
}: {
  screen: React.ComponentType<ScreenProps>;
  placement: Placement;
}) => (
  <Rail>
    {DEVICE_ORDER.map((device) => (
      <Screen key={device} device={device} placement={placement} />
    ))}
  </Rail>
);

/* --------------------------------------------------------- the swipe modal */

const REACTIONS = [
  { glyph: '❄️', label: 'Cold take - downvote', className: '!size-14' },
  { glyph: '😐', label: 'Skip hot take', className: '!size-12' },
  { glyph: '🔥', label: 'Hot take - upvote', className: '!size-14' },
];

const HotTakeModalScreen = ({ device, placement }: ScreenProps) => (
  <Device name={device}>
    <div className="flex flex-col bg-background-popover">
      <div className="flex items-center justify-between px-4 py-4">
        <span className="font-bold text-text-primary typo-title3">
          Hot Takes
        </span>
        <Button
          aria-label="Close"
          icon={<MiniCloseIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
      </div>

      <div className="px-4">
        <div className="flex select-none flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle shadow-2">
          <div className="flex flex-col items-center justify-center gap-3 break-words p-6">
            <div className="flex size-16 items-center justify-center rounded-16 bg-overlay-quaternary-cabbage text-[2.5rem]">
              😐
            </div>
            <span className="w-full break-words text-center font-bold text-text-primary typo-title3">
              Most developers have a talent for turning simple problems into
              overengineered nightmares.
            </span>
            <span className="w-full break-words text-center text-text-tertiary typo-body">
              &ldquo;Simplicity is prerequisite for reliability&rdquo; - Edsger
              W. Dijkstra
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-10 bg-surface-hover px-3 py-1">
                <HotIcon className="text-accent-cabbage-default" />
                <span className="font-bold text-text-secondary typo-footnote">
                  587
                </span>
              </span>
              <Control
                action="Snapshot"
                label={placement === 'chosen'}
                variant={
                  placement === 'chosen'
                    ? ButtonVariant.Primary
                    : ButtonVariant.Float
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-border-subtlest-tertiary p-4">
            <img
              alt=""
              className="size-10 rounded-full object-cover"
              src={AVATAR}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="flex min-w-0 items-center gap-1">
                <span className="min-w-0 truncate font-bold text-text-primary typo-callout">
                  James Davis
                </span>
                <span className="min-w-0 truncate text-text-tertiary typo-footnote">
                  @jamesdavis7
                </span>
              </span>
              <span className="flex items-center gap-1 text-text-tertiary typo-footnote">
                <ReputationIcon className="text-accent-onion-default" />
                11.4K
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 p-4 pt-3">
        {REACTIONS.map(({ glyph, label, className }) => (
          <Button
            key={label}
            aria-label={label}
            className={`${className} rounded-full`}
            icon={
              <span aria-hidden className="text-[1.375rem] leading-none">
                {glyph}
              </span>
            }
            size={ButtonSize.Large}
            variant={ButtonVariant.Float}
          />
        ))}
      </div>

      <div className="px-4 pb-4">
        <Button
          className="w-full"
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
        >
          Add your own hot take
        </Button>
      </div>
    </div>
  </Device>
);

/* -------------------------------------------------------- the profile list */

const TAKES = [
  {
    emoji: '🔥',
    title: 'Microservices were a mistake for most teams',
    subtitle: 'Distributed systems are a tax, not a feature',
    upvotes: 128,
  },
  {
    emoji: '🧊',
    title: 'Code review is mostly theatre',
    subtitle: 'Two approvals, forty seconds of reading',
    upvotes: 64,
  },
];

const HotTakeRow = ({
  take,
  placement,
}: {
  take: (typeof TAKES)[number];
  placement: Placement;
}) => (
  <div className="flex items-center gap-4 rounded-16 bg-surface-float p-4">
    <div className="flex size-12 shrink-0 items-center justify-center rounded-14 bg-overlay-quaternary-cabbage">
      <span className="text-2xl">{take.emoji}</span>
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="font-bold text-text-primary typo-body">
        {take.title}
      </span>
      <span className="text-text-tertiary typo-footnote">{take.subtitle}</span>
    </div>
    <div className="flex items-center gap-1">
      {placement === 'chosen' && (
        <Control action="Snapshot" size={ButtonSize.XSmall} />
      )}
      <Button
        icon={<UpvoteIcon />}
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Tertiary}
      >
        {take.upvotes}
      </Button>
    </div>
  </div>
);

const HotTakeListScreen = ({ device, placement }: ScreenProps) => (
  <Device name={device}>
    <div className="flex flex-col gap-3 p-4">
      <span className="font-bold text-text-primary typo-title3">Hot takes</span>
      {TAKES.map((take) => (
        <HotTakeRow key={take.title} placement={placement} take={take} />
      ))}
    </div>
  </Device>
);

/* -------------------------------------------------------- reading history */

const HISTORY = [
  'Why iconic tech brands lost their dominance',
  'The case against microservices',
  'Postgres is all you need, again',
];

const HistoryRow = ({
  title,
  device,
  placement,
  menuOpen,
}: {
  title: string;
  device: DeviceName;
  placement: Placement;
  menuOpen?: boolean;
}) => (
  <div className="flex items-center rounded-16 px-2 py-3">
    <div className="relative">
      <div className="size-16 rounded-16 bg-surface-float" />
      <img
        alt=""
        className="absolute -bottom-1 left-6 size-6 rounded-full border-2 border-background-default object-cover"
        src={AVATAR}
      />
    </div>
    <div className="ml-4 flex min-w-0 flex-1 flex-col">
      <h3 className="mr-6 line-clamp-2 break-words text-left text-text-primary typo-callout">
        {title}
      </h3>
      <span className="text-text-tertiary typo-footnote">
        4 min read · 128 upvotes
      </span>
    </div>
    <div className="ml-4 flex items-center">
      {device === 'Desktop' && (
        <>
          <Button
            aria-label="Upvote"
            icon={<UpvoteIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
          <Button
            aria-label="Downvote"
            icon={<DownvoteIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
        </>
      )}
      {placement === 'chosen' && <Control action="Link" />}
      <div className="relative">
        <Button
          aria-label="Options"
          icon={<MenuIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
        {menuOpen && (
          <OverflowMenu
            className="right-0 top-9"
            highlight="Share post via..."
            items={['Share post via...', 'Save to bookmarks', 'Remove post']}
          />
        )}
      </div>
    </div>
  </div>
);

const HistoryScreen = ({ device, placement }: ScreenProps) => (
  <Device name={device}>
    <div className="flex flex-col p-4">
      <span className="mb-2 font-bold text-text-primary typo-title3">
        Reading history
      </span>
      {HISTORY.map((title, index) => (
        <HistoryRow
          key={title}
          device={device}
          menuOpen={placement === 'today' && index === 0}
          placement={placement}
          title={title}
        />
      ))}
    </div>
  </Device>
);

/* -------------------------------------------------------------------- page */

const HotTakesAndHistory = () => (
  <SurfacePage
    intro="A hot take is a self-contained opinion with nowhere to link to, and it appears in two very different frames — the swipe modal and the profile list. A reading-history row is the opposite: a pointer back to a post."
    map="Sharing map: Snapshot leads on hot takes (#6365) — an opinion is quotable and the row is the whole payload. Copy link leads on reading history (#6361), where each row is just a post."
    title="Hot takes & reading history"
  >
    <Category
      covers="HotAndColdModal.tsx"
      title="Hot takes — the swipe modal"
      verdict="Where people actually meet a hot take, and the snapshot already ships on it: top card only, at Float, beside the upvote pill. Decided: promote it to labeled and filled."
    >
      <Variant
        headline="Snapshot at Float, beside the pill"
        note="What ships. Emoji tile, centred Title3, the quote in Body-tertiary, the upvote pill and a bordered author footer, with ❄️ 😐 🔥 and ‘Add your own hot take’ beneath. `isTop` only, so it never renders on the cards stacked behind."
        step="Today"
      >
        <Rails placement="today" screen={HotTakeModalScreen} />
      </Variant>
      <Variant
        headline="Snapshot labeled and filled"
        note="Decided. The card has the width for a label and nothing else in that row competes with it. The trade we accepted: a swipe surface gains a button people are meant to press rather than swipe past."
        step="Chosen"
      >
        <Rails placement="chosen" screen={HotTakeModalScreen} />
      </Variant>
    </Category>

    <Category
      covers="HotTakeItem.tsx"
      title="Hot takes — the profile list"
      verdict="The same content in a different frame: an emoji tile, title, subtitle and an upvote counter in a surface-float row. No ⋯ menu and no snapshot, so unlike the modal this list has no share route at all."
    >
      <Variant
        headline="Nothing to share, and no menu to bury it in"
        note="Edit and delete exist but are owner-only and hover-revealed, so the only control a visitor sees is the upvote."
        step="Today"
      >
        <Rails placement="today" screen={HotTakeListScreen} />
      </Variant>
      <Variant
        headline="Snapshot beside the upvote"
        note="Decided. XSmall to match the upvote counter it sits next to, and placed before it so the count stays at the edge. It produces the card the modal already produces, so this is a placement rather than a new feature."
        step="Chosen"
      >
        <Rails placement="chosen" screen={HotTakeListScreen} />
      </Variant>
    </Category>

    <Category
      covers="PostItemCard.tsx · ReadingHistoryOptionsMenu.tsx"
      title="Reading history"
      verdict="Each row is just a post, so the payload question never arises — only reach does. Decided: an icon-only copy link, always visible."
    >
      <Variant
        headline="⋯ → Share post via..."
        note="A 64px thumbnail with the source avatar overlapping it, a two-line title, then votes and the menu. Sharing is two taps, and the wording differs from every other menu in the product."
        step="Today"
      >
        <Rails placement="today" screen={HistoryScreen} />
      </Variant>
      <Variant
        headline="Copy link icon, before the menu"
        note="Decided, and no label: the row already drops its vote buttons below laptop, and a label would push the title to a third line on mobile. Always visible rather than hover-gated, so it survives touch."
        step="Chosen"
      >
        <Rails placement="chosen" screen={HistoryScreen} />
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof HotTakesAndHistory> = {
  title: 'Features/Snapshot/Surfaces/Hot takes & history',
  component: HotTakesAndHistory,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof HotTakesAndHistory> = {};
