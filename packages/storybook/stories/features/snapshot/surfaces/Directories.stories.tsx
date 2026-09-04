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
        <Control />
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
        <Control />
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

/** SquadGrid: banner, overlapping logo, then a full-width Join at the foot. */
const FeaturedSquadCard = () => (
  <div className="flex w-72 shrink-0 flex-col overflow-hidden rounded-16 border border-accent-cabbage-default bg-background-subtle">
    <div className="h-16 w-full bg-accent-onion-bolder" />
    <div className="-mt-8 flex flex-col gap-2 p-4">
      <div className="flex items-end justify-between">
        <img alt="" className="size-16 rounded-full object-cover" src={AVATAR} />
        <span className="rounded-10 bg-surface-float px-2 py-1 text-text-tertiary typo-caption2">
          5.1K
        </span>
      </div>
      <span className="font-bold text-text-primary typo-title3">
        Agentic Engineering
      </span>
      <span className="text-text-secondary typo-callout">agentic</span>
      <p className="text-text-secondary typo-footnote">
        Everything about agentic engineering and vibe coding.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <Button
          className="flex-1"
          size={ButtonSize.Medium}
          variant={ButtonVariant.Secondary}
        >
          Join Squad
        </Button>
        <Control />
      </div>
    </div>
  </div>
);

/** UnfeaturedSquadGrid: logo and Join on one row, body beneath. */
const DirectorySquadCard = () => (
  <div className="flex w-72 shrink-0 flex-col rounded-16 bg-background-subtle p-4">
    <div className="mb-3 flex items-center justify-between">
      <img alt="" className="size-16 rounded-full object-cover" src={AVATAR} />
      <div className="flex items-center gap-2">
        <Control />
        <Button size={ButtonSize.Medium} variant={ButtonVariant.Secondary}>
          Join
        </Button>
      </div>
    </div>
    <span className="font-bold text-text-primary typo-body">Learn Python</span>
    <p className="text-text-secondary typo-callout">
      Welcome to the Learn Python community.
    </p>
    <span className="mt-2 text-text-tertiary typo-footnote">
      @lpython · 27.4K members
    </span>
  </div>
);

const SquadScreen = ({ device }: { device: DeviceName }) => (
  <Device name={device}>
    <div className="flex flex-col gap-4 p-4">
      <h1 className="font-bold text-text-primary typo-title2">Featured</h1>
      <div className="flex gap-4 overflow-hidden">
        <FeaturedSquadCard />
        {device === 'Desktop' && <FeaturedSquadCard />}
      </div>
      <h2 className="font-bold text-text-primary typo-title3">Languages</h2>
      <div className="flex gap-4 overflow-hidden">
        <DirectorySquadCard />
        {device === 'Desktop' && <DirectorySquadCard />}
      </div>
    </div>
  </Device>
);

/* ----------------------------------------------------- squad page & rows */

/** SquadHeaderBar: the control joins the icon cluster after the bell. */
const SquadPageScreen = ({ device }: { device: DeviceName }) => (
  <Device name={device}>
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size={ButtonSize.Small} variant={ButtonVariant.Secondary}>
          Invitation link
        </Button>
        <Button
          aria-label="Squad notifications settings"
          icon={<BellIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
        />
        <Control />
        <Options />
      </div>
      <div className="flex items-center gap-2">
        <img alt="" className="size-16 rounded-full object-cover" src={AVATAR} />
        <div className="flex flex-col">
          <span className="font-bold text-text-primary typo-title2">
            TheCoverLikers
          </span>
          <span className="text-text-tertiary typo-footnote">
            @thecoverlikers · Created Feb 2023
          </span>
        </div>
      </div>
    </div>
  </Device>
);

/** SourceTopList: four ranked lists, the control revealed per row on hover. */
const SourceRowsScreen = ({ device }: { device: DeviceName }) => (
  <Device name={device}>
    <div className="flex flex-col gap-3 p-4">
      <h1 className="font-bold text-text-primary typo-title3">
        Trending sources
      </h1>
      {['Joud Awad', 'Work Chronicles', 'Appwrite'].map((name, index) => (
        <div
          key={name}
          className={`flex items-center gap-2 rounded-8 px-2 py-1 ${
            index === 0 ? 'bg-surface-float' : ''
          }`}
        >
          <span className="w-6 text-text-quaternary typo-callout">
            {index + 1}
          </span>
          <img
            alt=""
            className="size-8 rounded-full object-cover"
            src={AVATAR}
          />
          <span className="flex-1 truncate text-text-primary typo-caption1">
            {name}
          </span>
          {index === 0 && <Control />}
        </div>
      ))}
    </div>
  </Device>
);

/* ---------------------------------------------------------------- archive */

/** ArchiveIndexPage: a month grid, no posts and no feed controls. */
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
        <Control />
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
    intro="Tags, sources, squads and archives all end in a live feed, and each one now carries a copy link of its own. What differs is the frame around it — no two of these headers are laid out the same way, so the same control lands in a different place on each."
    map="Sharing map: Copy link leads on all of them (#6357, #6363, #6364). These are live pages — an image of a tag says nothing a feed does not, and the point of a squad share is joining. No snapshot on any of them."
    title="Topic & directory pages"
  >
    <Category
      covers="TagTopicPage.tsx · CustomFeedOptionsMenu.tsx"
      title="Tag page"
      verdict="A centred hero: H1, a ‘Tag · 48.2K followers · 12.4K stories’ line, the description, then Follow / Block / ⋯ centred beneath. No logo and no avatar — the type is the whole identity."
    >
      <Variant
        headline="Copy link in the button row"
        note="Sits between Block and the ⋯, matched to them at Small. The row is centred, so the extra control shifts everything — worth checking against the Sponsored hero above it."
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
        note="Cheaper here than on the tag page: the row is left-aligned and already mixes labeled and icon buttons, so one more icon costs nothing and moves nothing."
        step="Shipping"
      >
        <Rails Screen={SourceScreen} />
      </Variant>
    </Category>

    <Category
      covers="SquadGrid.tsx · UnfeaturedSquadGrid.tsx"
      title="Squad directory cards"
      verdict="Two shapes on one page. The featured card is a banner with an overlapping logo and a full-width Join at the foot; the rest are flat cards with the logo and Join on one row. Sharing lived in a ⋯ that only appeared on hover, so on touch there was no share route at all."
    >
      <Variant
        headline="Copy link beside Join"
        note="Always there on the featured card, which carries one squad at full size. The flatter cards sit many to a row, so the control waits for hover where hover exists and stays put below laptop."
        step="Shipping"
      >
        <Rails Screen={SquadScreen} />
      </Variant>
    </Category>

    <Category
      covers="SquadHeaderBar.tsx"
      title="Squad page"
      verdict="A wrapping cluster of controls above the squad identity: invitation link, the bell for members, analytics for moderators, then the ⋯."
    >
      <Variant
        headline="Copy link after the bell"
        note="Shares the bell's order so the two stay adjacent as the row wraps. Rendered for non-members too, since a public squad link is worth sharing before joining."
        step="Shipping"
      >
        <Rails Screen={SquadPageScreen} />
      </Variant>
    </Category>

    <Category
      covers="SourceTopList.tsx"
      title="Source directory lists"
      verdict="Four ranked lists — trending, popular, recently added, top video. Each row is a rank, an avatar and a handle, with no controls of any kind."
      >
      <Variant
        headline="Copy link revealed per row"
        note="Hover-revealed from laptop up and always present below it, so touch keeps a route. It fades rather than unmounting, which keeps the button reachable by keyboard."
        step="Shipping"
      >
        <Rails Screen={SourceRowsScreen} />
      </Variant>
    </Category>

    <Category
      covers="ArchiveIndexPage.tsx"
      title="Best of / archive"
      verdict="This page has no post list and no controls of any kind — breadcrumbs, an H1, and a grid of month tiles. The most linkable thing we publish, with nothing on it."
    >
      <Variant
        headline="Copy link beside the heading"
        note="Evergreen pages are worth landing on, so the link is the gift, and the heading row was empty. No snapshot: the page is a month grid rather than content, so an image would have to be generated from data instead of captured."
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
