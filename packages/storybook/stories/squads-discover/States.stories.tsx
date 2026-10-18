import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocPage, DocSection } from './doc';
import type { PreviewState } from './kit';
import {
  FavoriteButton,
  GroupLabel,
  JoinButton,
  JoinProvider,
  JoinToastHost,
  SquadRow,
} from './kit';
import { ImageCard } from './featured';
import { PackRow, PacksSection, withPacks } from './packs';
import { Device, PHONE } from './shell';
import { CategoryHub } from './layouts/CategoryHub';
import {
  PromotedKind,
  mySquads,
  promotedByKind,
  squad,
  starterPacks,
} from './data';

// Every piece of the design in every state it can be in, side by side, so
// each one can be checked without clicking around to find it. Each case
// says when it shows.

const meta: Meta = {
  title: 'Squads Discover/4. All states',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

/** One state: what it is, when it shows, and the thing itself. */
const Case = ({
  label,
  when,
  children,
  className,
}: {
  label: string;
  when: string;
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div className={`flex min-w-0 flex-col gap-2 ${className ?? ''}`}>
    <div className="flex flex-col">
      <span className="font-bold text-text-primary typo-callout">{label}</span>
      <span className="text-text-tertiary typo-footnote">{when}</span>
    </div>
    <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
      {children}
    </div>
  </div>
);

const Grid = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="grid grid-cols-1 items-start gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
    {children}
  </div>
);

/** A frozen state in its own join context. */
const Frozen = ({
  preview,
  initial = [],
  children,
}: {
  preview?: PreviewState;
  initial?: string[];
  children: ReactNode;
}): ReactElement => (
  <JoinProvider initial={initial} preview={preview}>
    {children}
  </JoinProvider>
);

const DesktopFrame = ({
  label,
  preview,
  joined,
  height = 900,
  children,
}: {
  label: string;
  preview?: PreviewState;
  joined?: string[];
  height?: number;
  children: ReactNode;
}): ReactElement => (
  <Device
    fit
    width={1440}
    height={height}
    label={label}
    preview={preview}
    joined={joined}
  >
    {children}
  </Device>
);

const PhoneFrame = ({
  label,
  preview,
  joined,
  height = PHONE.height,
  children,
}: {
  label: string;
  preview?: PreviewState;
  joined?: string[];
  height?: number;
  children: ReactNode;
}): ReactElement => (
  <Device
    width={PHONE.width}
    height={height}
    label={label}
    preview={preview}
    joined={joined}
  >
    {children}
  </Device>
);

const Frames = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex flex-wrap items-start gap-8">{children}</div>
);

const still = { autoAdvance: false } satisfies PreviewState;

/* ---------------------------------------------------------- join & feedback */

export const JoinFeedback: StoryObj = {
  name: 'Join & feedback',
  render: () => (
    <DocPage
      eyebrow="All states"
      title="Join and what follows it"
      intro={
        <p>The Join button&apos;s states and the toast every join raises.</p>
      }
    >
      <DocSection title="Join button">
        <Grid>
          <Case label="Join" when="Any Squad or pack you are not in">
            <Frozen>
              <JoinButton squad={squad('nextjs')} />
            </Frozen>
          </Case>
          <Case
            label="Banned"
            when="The Squad banned you. Hover for the tooltip"
          >
            <Frozen>
              <div className="pb-10">
                <JoinButton squad={squad('mlnews')} />
              </div>
            </Frozen>
          </Case>
          <Case
            label="Joined: no button"
            when="You are in it. Leaving happens on the Squad's page"
          >
            <Frozen initial={[squad('webdev').id]}>
              <SquadRow squad={squad('webdev')} />
            </Frozen>
          </Case>
        </Grid>
      </DocSection>

      <DocSection
        title="Toast"
        lead="Production's toast at the top of the window for 4 seconds, with Undo."
      >
        <Grid>
          <Case label="One Squad" when="After tapping Join on a Squad">
            <Frozen
              preview={{ toast: 'Joined NextJS', session: [squad('nextjs')] }}
            >
              <div className="relative h-16">
                <JoinToastHost className="!absolute !top-0" />
              </div>
            </Frozen>
          </Case>
          <Case label="A pack" when="After tapping Join on a starter pack">
            <Frozen
              preview={{
                toast: 'Joined 5 Squads',
                session: starterPacks[0].squads,
              }}
            >
              <div className="relative h-16">
                <JoinToastHost className="!absolute !top-0" />
              </div>
            </Frozen>
          </Case>
          <Case
            label="Part of a pack"
            when="You were already in some of the pack's Squads"
          >
            <Frozen
              preview={{
                toast: 'Joined 3 Squads',
                session: starterPacks[0].squads.slice(0, 3),
              }}
            >
              <div className="relative h-16">
                <JoinToastHost className="!absolute !top-0" />
              </div>
            </Frozen>
          </Case>
        </Grid>
      </DocSection>

      <DocSection title="In place">
        <Frames>
          <PhoneFrame
            label="Phone · toast after a join"
            preview={{
              ...still,
              toast: 'Joined NextJS',
              session: [squad('nextjs')],
            }}
          >
            <CategoryHub />
          </PhoneFrame>
        </Frames>
      </DocSection>
    </DocPage>
  ),
};

/* ------------------------------------------------------------- squad rows */

const rowCases: {
  label: string;
  when: string;
  squad: string;
  promoted?: boolean;
}[] = [
  { label: 'Regular', when: 'Most Squads', squad: 'nextjs' },
  {
    label: 'Verified company',
    when: 'Verified Company Squads: the seal after the name',
    squad: 'agentfield',
  },
  {
    label: 'New Squad',
    when: 'Under 50 members: "New Squad" instead of a small count',
    squad: 'ahurasense',
  },
  {
    label: 'Long name',
    when: 'Names and meta lines cut off with an ellipsis',
    squad: 'shiftmag',
  },
  {
    label: 'Promoted · regular',
    when: 'A paid campaign: "Promoted" leads the meta line',
    squad: promotedByKind[PromotedKind.Regular].handle,
    promoted: true,
  },
  {
    label: 'Promoted · verified',
    when: 'A verified company buying the slot: seal and label',
    squad: promotedByKind[PromotedKind.Verified].handle,
    promoted: true,
  },
  {
    label: 'Banned',
    when: 'The Squad banned you: Join disabled',
    squad: 'mlnews',
  },
  {
    label: 'Joined',
    when: 'You are in it: no button',
    squad: 'webdev',
  },
];

const FavoriteRow = ({ initial }: { initial: boolean }): ReactElement => {
  const [on, setOn] = useState(initial);
  const item = mySquads[0];
  return (
    <SquadRow
      squad={item}
      join={false}
      action={
        <FavoriteButton
          squad={item}
          favorited={on}
          onToggle={() => setOn(!on)}
        />
      }
    />
  );
};

export const Rows: StoryObj = {
  name: 'Squad rows',
  render: () => (
    <DocPage
      eyebrow="All states"
      title="Squad rows"
      intro={
        <p>
          One row everywhere. Compact in Trending and the widgets; with its
          description and the big image in topic lists.
        </p>
      }
    >
      {(['compact', 'list'] as const).map((kind) => (
        <DocSection
          key={kind}
          title={
            kind === 'compact'
              ? 'Compact · Trending, widgets'
              : 'With description · topic lists'
          }
        >
          <Grid>
            {rowCases.map((item) => (
              <Case key={item.label} label={item.label} when={item.when}>
                <Frozen initial={[squad('webdev').id]}>
                  <SquadRow
                    squad={squad(item.squad)}
                    promoted={item.promoted}
                    description={kind === 'list'}
                    size={kind === 'list' ? 'large' : 'medium'}
                  />
                </Frozen>
              </Case>
            ))}
          </Grid>
        </DocSection>
      ))}
      <DocSection title="My Squads row">
        <Grid>
          <Case
            label="Favorited"
            when="A Squad you starred: the star stays filled"
          >
            <Frozen>
              <FavoriteRow initial />
            </Frozen>
          </Case>
          <Case
            label="Not favorited"
            when="On laptop the empty star shows on hover only"
          >
            <Frozen>
              <FavoriteRow initial={false} />
            </Frozen>
          </Case>
        </Grid>
      </DocSection>
      <DocSection title="Group labels · topic lists">
        <Grid>
          <Case
            label="Verified company Squads"
            when="A topic with Verified Company Squads: they lead"
          >
            <GroupLabel label="Verified company Squads" />
          </Case>
          <Case label="More in AI" when="The rest of that topic after them">
            <GroupLabel label="More in AI" />
          </Case>
          <Case
            label="No labels"
            when="A topic without verified Squads: one plain list"
          >
            <span className="text-text-quaternary typo-footnote">
              Nothing shows
            </span>
          </Case>
        </Grid>
      </DocSection>
    </DocPage>
  ),
};

/* ---------------------------------------------------------------- featured */

const tile = (handle: string, promoted = false) => ({
  squad: squad(handle),
  promoted,
});

export const Featured: StoryObj = {
  name: 'Featured',
  render: () => (
    <DocPage
      eyebrow="All states"
      title="Featured"
      intro={
        <p>
          The mosaic from tablet, the banner rail on phones. It moves on its own
          every 5 seconds; here it is held still.
        </p>
      }
    >
      <DocSection title="Tiles">
        <Grid>
          <Case label="Lead tile" when="The first tile of every block">
            <div className="h-80">
              <ImageCard
                slot={tile('devrel')}
                size="large"
                className="size-full"
              />
            </div>
          </Case>
          <Case
            label="Lead tile · promoted"
            when="A featured campaign in the lead: Promoted eyebrow"
          >
            <div className="h-80">
              <ImageCard
                slot={tile(promotedByKind[PromotedKind.Featured].handle, true)}
                size="large"
                className="size-full"
              />
            </div>
          </Case>
          <Case label="Small tile" when="The other tiles of a block">
            <div className="aspect-square w-56">
              <ImageCard
                slot={tile('javadevs')}
                size="small"
                className="size-full"
              />
            </div>
          </Case>
          <Case
            label="Small tile · promoted"
            when="The campaign's usual place: the second tile"
          >
            <div className="aspect-square w-56">
              <ImageCard
                slot={tile(promotedByKind[PromotedKind.Featured].handle, true)}
                size="small"
                className="size-full"
              />
            </div>
          </Case>
          <Case
            label="Small tile · verified and featured"
            when="Seal on the name; a New Squad under 50 members"
          >
            <div className="aspect-square w-56">
              <ImageCard
                slot={tile(
                  promotedByKind[PromotedKind.VerifiedFeatured].handle,
                )}
                size="small"
                className="size-full"
              />
            </div>
          </Case>
        </Grid>
      </DocSection>
      <DocSection
        title="The rail at each position"
        lead="Laptop and up. The first block has only the right arrow, the last only the left."
      >
        {(['first', 'middle', 'last'] as const).map((at) => (
          <DesktopFrame
            key={at}
            label={`Desktop 1440 · ${at} block`}
            height={560}
            preview={{ ...still, featuredAt: at }}
          >
            <CategoryHub />
          </DesktopFrame>
        ))}
      </DocSection>
      <DocSection title="By width">
        <Device
          fit
          width={1020}
          height={560}
          label="Laptop 1020 · big tile + 2 small"
          preview={still}
        >
          <CategoryHub />
        </Device>
        <Device
          fit
          width={768}
          height={520}
          label="Tablet 768 · swipe, no arrows"
          preview={still}
        >
          <CategoryHub />
        </Device>
        <PhoneFrame label="Phone · banner rail" height={560} preview={still}>
          <CategoryHub />
        </PhoneFrame>
      </DocSection>
    </DocPage>
  ),
};

/* ------------------------------------------------------------ starter packs */

export const Packs: StoryObj = {
  name: 'Starter packs',
  render: () => (
    <DocPage
      eyebrow="All states"
      title="Starter packs"
      intro={<p>Tsahi&apos;s design from the onboarding step.</p>}
    >
      <DocSection title="Pack row">
        <Grid>
          <Case label="Join" when="You are in none of its Squads">
            <Frozen>
              <PackRow pack={starterPacks[0]} as="div" />
            </Frozen>
          </Case>
          <Case
            label="Partly joined"
            when="You are in some: Join adds the rest"
          >
            <Frozen
              initial={starterPacks[0].squads.slice(0, 2).map((s) => s.id)}
            >
              <PackRow pack={starterPacks[0]} as="div" />
            </Frozen>
          </Case>
          <Case label="All joined" when="You are in every Squad: no button">
            <Frozen initial={starterPacks[0].squads.map((s) => s.id)}>
              <PackRow pack={starterPacks[0]} as="div" />
            </Frozen>
          </Case>
        </Grid>
      </DocSection>
      <DocSection title="Where packs show">
        <Grid>
          <Case
            label="A topic's own pack"
            when="Opens that topic's list, at every width"
          >
            <Frozen>{withPacks('ai', [])}</Frozen>
          </Case>
        </Grid>
        <Case
          label="Discover section"
          when="Between Trending and the topics: 1 column to tablet, 2 from laptop, 3 from 1360"
        >
          <Frozen>
            <PacksSection />
          </Frozen>
        </Case>
      </DocSection>
    </DocPage>
  ),
};

/* -------------------------------------------------------------- topic pages */

export const TopicPages: StoryObj = {
  name: 'Topic pages',
  render: () => (
    <DocPage
      eyebrow="All states"
      title="Topic and Featured pages"
      intro={
        <p>
          Every tab other than Discover and My Squads, in the squad page frame.
        </p>
      }
    >
      <DocSection title="Desktop">
        <DesktopFrame label="With Verified Company Squads · AI" preview={still}>
          <CategoryHub initialCategory="ai" />
        </DesktopFrame>
        <DesktopFrame
          label="Without verified Squads · DevTools (no group labels)"
          preview={still}
        >
          <CategoryHub initialCategory="devtools" />
        </DesktopFrame>
        <DesktopFrame label="Featured tab" preview={still}>
          <CategoryHub initialCategory="featured" />
        </DesktopFrame>
      </DocSection>
      <DocSection title="Phone">
        <Frames>
          <PhoneFrame label="Top · pack, then the Promoted row" preview={still}>
            <CategoryHub initialCategory="ai" />
          </PhoneFrame>
          <PhoneFrame
            label="End · Starter packs and Trending, header hidden"
            preview={{ ...still, scrollEnd: true }}
          >
            <CategoryHub initialCategory="ai" />
          </PhoneFrame>
        </Frames>
      </DocSection>
    </DocPage>
  ),
};

/* ---------------------------------------------------------------- my squads */

export const MySquadsStates: StoryObj = {
  name: 'My Squads',
  render: () => (
    <DocPage
      eyebrow="All states"
      title="My Squads"
      intro={
        <p>
          Production&apos;s page, plus an empty state instead of the redirect.
        </p>
      }
    >
      <DocSection title="Desktop">
        <DesktopFrame
          label="Moderator · Pending posts, both groups"
          preview={{ ...still, mySquads: 'moderator' }}
        >
          <CategoryHub initialCategory="my" />
        </DesktopFrame>
        <DesktopFrame
          label="Member only · no Pending posts, one group"
          preview={{ ...still, mySquads: 'member' }}
        >
          <CategoryHub initialCategory="my" />
        </DesktopFrame>
        <DesktopFrame
          label="No Squads yet · starter packs"
          preview={{ ...still, mySquads: 'empty' }}
          joined={[]}
        >
          <CategoryHub initialCategory="my" />
        </DesktopFrame>
      </DocSection>
      <DocSection title="Phone">
        <Frames>
          <PhoneFrame
            label="Moderator"
            preview={{ ...still, mySquads: 'moderator' }}
          >
            <CategoryHub initialCategory="my" />
          </PhoneFrame>
          <PhoneFrame
            label="No Squads yet"
            preview={{ ...still, mySquads: 'empty' }}
            joined={[]}
          >
            <CategoryHub initialCategory="my" />
          </PhoneFrame>
        </Frames>
      </DocSection>
    </DocPage>
  ),
};

/* --------------------------------------------------------------- navigation */

export const Navigation: StoryObj = {
  name: 'Header & navigation',
  render: () => (
    <DocPage
      eyebrow="All states"
      title="Header and navigation"
      intro={
        <p>
          Laptop: the v2 rail and the tab strip. Tablet: SidebarTablet&apos;s
          rail and the same strip. Phone: production&apos;s new shell, the title
          block with chips at the top and the floating bar at the bottom.
        </p>
      }
    >
      <DocSection title="Laptop">
        <DesktopFrame label="Logged in" height={420} preview={still}>
          <CategoryHub />
        </DesktopFrame>
        <DesktopFrame
          label="Logged out · no My Squads tab"
          height={420}
          preview={still}
          joined={[]}
        >
          <CategoryHub loggedOut />
        </DesktopFrame>
      </DocSection>
      <DocSection title="Tablet">
        <Device
          fit
          width={820}
          height={520}
          label="Tablet 820 · logged in"
          preview={still}
        >
          <CategoryHub />
        </Device>
        <Device
          fit
          width={820}
          height={520}
          label="Tablet 820 · logged out (no My Squads, no sign-up prompt)"
          preview={still}
          joined={[]}
        >
          <CategoryHub loggedOut />
        </Device>
      </DocSection>
      <DocSection title="Phone">
        <Frames>
          <PhoneFrame
            label="Logged in · search, New Squad, avatar"
            preview={still}
          >
            <CategoryHub />
          </PhoneFrame>
          <PhoneFrame
            label="Logged out · Log in and Open app"
            preview={still}
            joined={[]}
          >
            <CategoryHub loggedOut />
          </PhoneFrame>
          <PhoneFrame
            label="Scrolled down · block hidden, bar compact"
            preview={{ ...still, scrollEnd: true }}
          >
            <CategoryHub />
          </PhoneFrame>
          <PhoneFrame label="A topic chip lit · AI" preview={still}>
            <CategoryHub initialCategory="ai" />
          </PhoneFrame>
        </Frames>
      </DocSection>
    </DocPage>
  ),
};

/* ------------------------------------------------------- pending posts */

const steps: {
  label: string;
  when: string;
  tab: string;
  preview: PreviewState;
}[] = [
  {
    label: '1 · My Squads',
    when: 'A moderator with posts waiting: the Pending posts row, count by its label',
    tab: 'my',
    preview: {},
  },
  {
    label: '2 · The queue',
    when: 'Tapping it opens /squads/moderate: every pending post, Approve all on top',
    tab: 'moderate',
    preview: { moderation: 'queue' },
  },
  {
    label: '3 · Post preview',
    when: 'Tapping a post opens it in full, Decline and Approve on top',
    tab: 'moderate',
    preview: { moderation: 'preview' },
  },
  {
    label: '4 · Decline',
    when: 'Decline asks why; Submit report stays off until a reason is picked',
    tab: 'moderate',
    preview: { moderation: 'decline' },
  },
  {
    label: '5 · Approve all',
    when: 'With more than one post: one confirmation, no undo',
    tab: 'moderate',
    preview: { moderation: 'approve-all' },
  },
  {
    label: '6 · After approving one',
    when: 'The post leaves the queue, a toast confirms it',
    tab: 'moderate',
    preview: { moderation: 'approved' },
  },
  {
    label: '7 · Back on My Squads',
    when: 'The count follows the queue',
    tab: 'my',
    preview: { moderation: 'approved' },
  },
  {
    label: '8 · All done',
    when: 'Nothing left to review',
    tab: 'moderate',
    preview: { moderation: 'empty' },
  },
  {
    label: '9 · My Squads, queue empty',
    when: 'The Pending posts row goes away',
    tab: 'my',
    preview: { moderation: 'empty' },
  },
];

export const PendingPostsFlow: StoryObj = {
  name: 'Pending posts flow',
  render: () => (
    <DocPage
      eyebrow="All states"
      title="Pending posts, from My Squads to an empty queue"
      intro={
        <p>
          Production&apos;s moderation flow (/squads/moderate,
          SquadModerationList and its modals), with the new Pending posts row as
          its way in. Every frame is interactive: tap through it from step 1 on
          either device.
        </p>
      }
    >
      <DocSection title="Desktop">
        <div className="grid grid-cols-1 gap-8 laptop:grid-cols-2">
          {steps.map((step) => (
            <Case key={step.label} label={step.label} when={step.when}>
              <Device
                fit
                width={1440}
                height={900}
                preview={{ ...still, ...step.preview }}
              >
                <CategoryHub initialCategory={step.tab} />
              </Device>
            </Case>
          ))}
        </div>
      </DocSection>
      <DocSection title="Phone">
        <Frames>
          {steps.map((step) => (
            <Device
              key={step.label}
              width={PHONE.width}
              height={PHONE.height}
              label={step.label}
              preview={{ ...still, ...step.preview }}
            >
              <CategoryHub initialCategory={step.tab} />
            </Device>
          ))}
        </Frames>
      </DocSection>
    </DocPage>
  ),
};
