import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BellIcon,
  BlockIcon,
  MenuIcon,
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

/** CustomFeedOptionsMenu — the same two items on tags, sources and profiles. */
const FEED_MENU = ['Share', 'Add to custom feed'];

type Spot = 'today' | 'menu' | 'inline' | 'labeled';

const Options = ({ spot }: { spot: Spot }) => (
  <div className="relative">
    <Button
      aria-label="Options"
      icon={<MenuIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    {spot === 'menu' && (
      <OverflowMenu
        className="right-0 top-9"
        highlight="Share"
        items={FEED_MENU}
      />
    )}
  </div>
);

/* ------------------------------------------------------------------- tags */

/** TagTopicPage: a centred hero, not a row. No logo, no avatar. */
const TagScreen = ({ device, spot }: { device: DeviceName; spot: Spot }) => (
  <Device name={device}>
    {/* TagPageNavbar — full-bleed strip of related tags. */}
    <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-border-subtlest-tertiary px-4 py-2">
      {['typescript', 'javascript', 'react', 'node', 'webdev'].map(
        (tag, index) => (
          <span
            key={tag}
            className={`whitespace-nowrap rounded-10 px-2 py-1 typo-footnote ${
              index === 0
                ? 'bg-surface-float font-bold text-text-primary'
                : 'text-text-tertiary'
            }`}
          >
            #{tag}
          </span>
        ),
      )}
    </div>

    <header className="mx-auto flex w-full max-w-[48rem] flex-col items-center gap-4 px-4 py-8 text-center">
      <h1
        className={`font-bold text-text-primary ${
          device === 'Mobile' ? 'typo-title2' : 'typo-large-title'
        }`}
      >
        TypeScript
      </h1>
      <span className="flex flex-wrap items-center justify-center gap-x-2 text-text-tertiary typo-callout">
        <span>Tag</span>
        <span aria-hidden>·</span>
        <span>48.2K followers</span>
        <span aria-hidden>·</span>
        <span>12.4K stories</span>
      </span>
      <p className="max-w-[44rem] text-text-secondary typo-body">
        A typed superset of JavaScript that compiles to plain JavaScript.
      </p>
      <div className="mt-1 flex flex-row items-center justify-center gap-3">
        <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
          Follow
        </Button>
        <Button
          icon={<BlockIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
        >
          Block
        </Button>
        {spot === 'inline' && <Control action="Link" />}
        {spot === 'labeled' && (
          <Control action="Link" label variant={ButtonVariant.Secondary} />
        )}
        <Options spot={spot} />
      </div>
    </header>
  </Device>
);

/* ---------------------------------------------------------------- sources */

/** The source page is left-aligned, and its actions sit below the title. */
const SourceScreen = ({ device, spot }: { device: DeviceName; spot: Spot }) => (
  <Device name={device}>
    <div className="flex flex-col gap-3 p-4">
      <span className="text-text-tertiary typo-footnote">
        Sources / XDA Developers
      </span>

      <div className="flex items-center font-bold">
        <img alt="" className="size-10 rounded-full object-cover" src={AVATAR} />
        <h1 className="ml-2 w-fit text-text-primary typo-title2">
          XDA Developers
        </h1>
      </div>

      <div className="flex flex-row items-center gap-2">
        <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
          Follow
        </Button>
        <Button
          aria-label="Notifications"
          icon={<BellIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
        />
        {spot === 'inline' && <Control action="Link" />}
        {spot === 'labeled' && (
          <Control action="Link" label variant={ButtonVariant.Secondary} />
        )}
        <Options spot={spot} />
      </div>

      <p className="text-text-primary typo-body">
        News and reviews for developers, by developers.
      </p>

      <div className="flex flex-wrap gap-2">
        {['#android', '#hardware', '#reviews'].map((tag) => (
          <span
            key={tag}
            className="rounded-8 bg-surface-float px-2 py-1 text-text-tertiary typo-caption1"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  </Device>
);

/* ----------------------------------------------------------------- squads */

/** SquadEntityCard: w-80, image and actions on one row, body under it. */
const SquadCard = ({ spot }: { spot: Spot }) => (
  <div className="flex w-80 shrink-0 flex-col items-center rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4">
    <div className="flex w-full items-start justify-between gap-2">
      <img alt="" className="size-10 rounded-full object-cover" src={AVATAR} />
      <div className="relative flex items-center gap-2">
        {spot === 'inline' && <Control action="Link" />}
        {spot === 'labeled' && (
          <Control action="Link" label variant={ButtonVariant.Secondary} />
        )}
        <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
          Join
        </Button>
        {/* SquadHeaderMenu — `invisible group-hover/menu:visible`. */}
        <Button
          aria-label="Options"
          icon={<MenuIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
        {spot === 'menu' && (
          <OverflowMenu
            className="right-0 top-9"
            highlight="Share via"
            items={['Share via', 'Hide', 'Block frontend-fans', 'Report']}
          />
        )}
      </div>
    </div>
    <div className="mt-3 flex w-full flex-col gap-2">
      <span className="font-bold text-text-primary typo-body">
        Frontend Fans
      </span>
      <p className="text-text-secondary typo-footnote">
        Everything CSS, React and the browser. Ship it and show it.
      </p>
      <span className="flex items-center gap-1 text-text-tertiary typo-footnote">
        2.4K Members
        <span aria-hidden>·</span>
        12K Upvotes
      </span>
    </div>
  </div>
);

const SquadScreen = ({ device, spot }: { device: DeviceName; spot: Spot }) => (
  <Device name={device}>
    <div className="flex flex-col gap-4 p-4">
      <h1 className="font-bold text-text-primary typo-title2">Squads</h1>
      <div className="flex gap-4 overflow-hidden">
        <SquadCard spot={spot} />
        {device === 'Desktop' && <SquadCard spot="today" />}
      </div>
    </div>
  </Device>
);

/* ---------------------------------------------------------------- archive */

/** ArchiveIndexPage: a month grid, no posts and no controls. */
const ArchiveScreen = ({
  device,
  spot,
}: {
  device: DeviceName;
  spot: Spot;
}) => (
  <Device name={device}>
    <div className="flex flex-col gap-4 py-4">
      <span className="px-4 text-text-tertiary typo-footnote">
        Sources / XDA Developers / Best of
      </span>
      <div className="flex items-center gap-2 px-4">
        <h1
          className={`flex-1 font-bold text-text-primary ${
            device === 'Mobile' ? 'typo-title2' : 'typo-title1'
          }`}
        >
          Best of XDA Developers &mdash; Archive
        </h1>
        {spot === 'inline' && <Control action="Link" />}
        {spot === 'labeled' && (
          <>
            <Control action="Snapshot" />
            <Control action="Link" label variant={ButtonVariant.Secondary} />
          </>
        )}
      </div>

      <div className="flex flex-col gap-4 px-4">
        {['2026', '2025'].map((year) => (
          <div key={year}>
            <h2 className="mb-3 font-bold text-text-primary typo-title3">
              {year}
            </h2>
            <div
              className={`grid gap-3 ${
                device === 'Mobile' ? 'grid-cols-3' : 'grid-cols-4'
              }`}
            >
              {['January', 'February', 'March', 'April'].map((month) => (
                <span
                  key={month}
                  className="flex flex-col gap-1 rounded-12 border border-border-subtlest-tertiary p-3"
                >
                  <span className="font-bold text-text-primary typo-callout">
                    {month}
                  </span>
                  <span className="text-text-tertiary typo-footnote">
                    24 posts
                  </span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </Device>
);

/* -------------------------------------------------------------------- page */

const Rails = ({
  Screen,
  spot,
}: {
  Screen: React.ComponentType<{ device: DeviceName; spot: Spot }>;
  spot: Spot;
}) => (
  <Rail>
    <Screen device="Desktop" spot={spot} />
    <Screen device="Tablet" spot={spot} />
    <Screen device="Mobile" spot={spot} />
  </Rail>
);

const Directories = () => (
  <SurfacePage
    intro="Tags, sources, squads and archives all end in a live feed, and all four put sharing behind the same ⋯ menu. What differs is the frame around it — and no two of these four headers are laid out the same way."
    map="Sharing map: Copy link leads on all of them (#6357, #6363, #6364). These are live pages — an image of a tag says nothing a feed does not, and the point of a squad share is joining."
    title="Topic & directory pages"
  >
    <Category
      covers="TagTopicPage.tsx · CustomFeedOptionsMenu.tsx"
      title="Tag page"
      verdict="A centred hero: H1, a ‘Tag · 48.2K followers · 12.4K stories’ line, the description, then Follow / Block / ⋯ centred beneath. No logo and no avatar — the type is the whole identity."
    >
      <Variant
        headline="⋯ → Share, beside Follow and Block"
        note="CustomFeedOptionsMenu carries two items: Share, then Add to custom feed. Share resolves through useShareOrCopyLink — the native sheet on mobile, a clipboard copy on desktop."
        step="Today"
      >
        <Rails Screen={TagScreen} spot="menu" />
      </Variant>
      <Variant
        headline="Copy link in the button row"
        note="Recommended. Sits between Block and the ⋯, matched to them at Small. The row is centred, so an extra control shifts everything — worth checking against the Sponsored hero above it."
        step="Recommended"
      >
        <Rails Screen={TagScreen} spot="inline" />
      </Variant>
      <Variant
        headline="Labeled, in the same row"
        note="Three labeled buttons on a centred row is the point where the hero stops reading as a hierarchy. Included as the ceiling, not a recommendation."
        step="Push"
      >
        <Rails Screen={TagScreen} spot="labeled" />
      </Variant>
    </Category>

    <Category
      covers="pages/sources/[source].tsx · SourceActions/index.tsx"
      title="Source page"
      verdict="Same menu, completely different frame: breadcrumbs, a 40px round logo beside a typo-title2 H1, and the action row on its own line below rather than beside the title."
    >
      <Variant
        headline="⋯ → Share, under the title"
        note="SourceActions renders Follow, then either the bell or Block, then the same CustomFeedOptionsMenu. Left-aligned, so an added control does not move anything."
        step="Today"
      >
        <Rails Screen={SourceScreen} spot="menu" />
      </Variant>
      <Variant
        headline="Copy link beside the bell"
        note="Recommended, and cheaper here than on the tag page: the row is left-aligned and already mixes labeled and icon buttons, so one more icon costs nothing."
        step="Recommended"
      >
        <Rails Screen={SourceScreen} spot="inline" />
      </Variant>
    </Category>

    <Category
      covers="SquadEntityCard.tsx · EntityCard.tsx · SquadHeaderMenu"
      title="Squad directory card"
      verdict="A w-80 card: logo top-left, Join and ⋯ top-right, then name, description and ‘2.4K Members · 12K Upvotes’. The ⋯ is `invisible group-hover/menu:visible` — so on touch there is no share route at all."
    >
      <Variant
        headline="⋯ → Share via, hidden until hover"
        note="The menu button only becomes visible on hover, which means the entire share path on this card does not exist on a phone."
        step="Today"
      >
        <Rails Screen={SquadScreen} spot="menu" />
      </Variant>
      <Variant
        headline="A persistent copy-link icon"
        note="Recommended. Always visible, so it works on touch, and placed before Join so it never competes with the conversion button."
        step="Recommended"
      >
        <Rails Screen={SquadScreen} spot="inline" />
      </Variant>
    </Category>

    <Category
      covers="ArchiveIndexPage.tsx"
      title="Best of / archive"
      verdict="Corrected: this page has no post list and no controls of any kind. It is breadcrumbs, an H1, and a grid of month tiles — the most linkable thing we publish, with nothing on it."
    >
      <Variant
        headline="Breadcrumbs, a heading, month tiles"
        note="Every tile is a link to a month. There is no menu here to bury sharing in, which makes it the only surface in this set where a control would be the first one on the page."
        step="Today"
      >
        <Rails Screen={ArchiveScreen} spot="today" />
      </Variant>
      <Variant
        headline="Copy link beside the heading"
        note="Recommended. Evergreen pages are worth landing on, so the link is the gift, and the heading row is empty."
        step="Recommended"
      >
        <Rails Screen={ArchiveScreen} spot="inline" />
      </Variant>
      <Variant
        headline="Labeled, with a snapshot of the archive"
        note="The snapshot would have to be generated from data rather than captured — the page is a month grid, not content — which makes it a different piece of work from every other snapshot on the board."
        step="Push"
      >
        <Rails Screen={ArchiveScreen} spot="labeled" />
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof Directories> = {
  title: 'Features/Snapshot/Surfaces/Topic & directory pages',
  component: Directories,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof Directories> = {};
