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
  Rail,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

/** CustomFeedOptionsMenu — the same two items on tags, sources and profiles. */

const Options = () => (
  <Button
    aria-label="Options"
    icon={<MenuIcon />}
    size={ButtonSize.Small}
    variant={ButtonVariant.Tertiary}
  />
);

/* ------------------------------------------------------------------- tags */

/** TagTopicPage: a centred hero, not a row. No logo, no avatar. */
const TagScreen = ({ device }: { device: DeviceName }) => (
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
        <Control action="Link" />
        <Options />
      </div>
    </header>
  </Device>
);

/* ---------------------------------------------------------------- sources */

/** The source page is left-aligned, and its actions sit below the title. */
const SourceScreen = ({ device }: { device: DeviceName }) => (
  <Device name={device}>
    <div className="flex flex-col gap-3 p-4">
      <span className="text-text-tertiary typo-footnote">
        Sources / XDA Developers
      </span>

      <div className="flex items-center font-bold">
        <img
          alt=""
          className="size-10 rounded-full object-cover"
          src={AVATAR}
        />
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
        <Control action="Link" />
        <Options />
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
const SquadCard = () => (
  <div className="flex w-80 shrink-0 flex-col items-center rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4">
    <div className="flex w-full items-start justify-between gap-2">
      <img alt="" className="size-10 rounded-full object-cover" src={AVATAR} />
      <div className="relative flex items-center gap-2">
        <Control action="Link" />
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

const SquadScreen = ({ device }: { device: DeviceName }) => (
  <Device name={device}>
    <div className="flex flex-col gap-4 p-4">
      <h1 className="font-bold text-text-primary typo-title2">Squads</h1>
      <div className="flex gap-4 overflow-hidden">
        <SquadCard />
      </div>
    </div>
  </Device>
);

/* ---------------------------------------------------------------- archive */

/** ArchiveIndexPage: a month grid, no posts and no controls. */
const ArchiveScreen = ({ device }: { device: DeviceName }) => (
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
        <Control action="Link" />
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
}: {
  Screen: React.ComponentType<{ device: DeviceName }>;
}) => (
  <Rail>
    <Screen device="Desktop" />
    <Screen device="Tablet" />
    <Screen device="Mobile" />
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
        headline="Copy link in the button row"
        note="Recommended. Sits between Block and the ⋯, matched to them at Small. The row is centred, so an extra control shifts everything — worth checking against the Sponsored hero above it."
        step="Shipping"
      >
        <Rails Screen={TagScreen} />
      </Variant>
    </Category>

    <Category
      covers="pages/sources/[source].tsx · SourceActions/index.tsx"
      title="Source page"
      verdict="Same menu, completely different frame: breadcrumbs, a 40px round logo beside a typo-title2 H1, and the action row on its own line below rather than beside the title."
    >
      <Variant
        headline="Copy link beside the bell"
        note="Recommended, and cheaper here than on the tag page: the row is left-aligned and already mixes labeled and icon buttons, so one more icon costs nothing."
        step="Shipping"
      >
        <Rails Screen={SourceScreen} />
      </Variant>
    </Category>

    <Category
      covers="SquadEntityCard.tsx · EntityCard.tsx · SquadHeaderMenu"
      title="Squad directory card"
      verdict="A w-80 card: logo top-left, Join and ⋯ top-right, then name, description and ‘2.4K Members · 12K Upvotes’. The ⋯ is `invisible group-hover/menu:visible` — so on touch there is no share route at all."
    >
      <Variant
        headline="A persistent copy-link icon"
        note="Recommended. Always visible, so it works on touch, and placed before Join so it never competes with the conversion button."
        step="Shipping"
      >
        <Rails Screen={SquadScreen} />
      </Variant>
    </Category>

    <Category
      covers="ArchiveIndexPage.tsx"
      title="Best of / archive"
      verdict="Corrected: this page has no post list and no controls of any kind. It is breadcrumbs, an H1, and a grid of month tiles — the most linkable thing we publish, with nothing on it."
    >
      <Variant
        headline="Copy link beside the heading"
        note="Recommended. Evergreen pages are worth landing on, so the link is the gift, and the heading row is empty."
        step="Shipping"
      >
        <Rails Screen={ArchiveScreen} />
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
