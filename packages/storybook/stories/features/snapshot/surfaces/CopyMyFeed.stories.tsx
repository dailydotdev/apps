import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  AiIcon,
  ArrowIcon,
  BlockIcon,
  CopyIcon,
  EditIcon,
  FilterIcon,
  HashtagIcon,
  LinkIcon,
  PlusIcon,
  PlusUserIcon,
  StarIcon,
  TrashIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { DeviceName } from '../surfaceChrome';
import {
  AVATAR,
  Category,
  Device,
  Rail,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

type Spot = 'today' | 'section' | 'list';

const MENU: [string, React.ReactElement][] = [
  ['General', <EditIcon key="general" />],
  ['Tags', <HashtagIcon key="tags" />],
  ['Content sources', <PlusUserIcon key="sources" />],
  ['Content preferences', <FilterIcon key="preferences" />],
  ['AI superpowers', <AiIcon key="ai" />],
  ['Filters', <FilterIcon key="filters" />],
  ['Blocked content', <BlockIcon key="blocking" />],
];

const Field = ({
  label,
  value,
  counter,
}: {
  label: string;
  value: string;
  counter?: string;
}) => (
  <div className="flex w-full items-center gap-2 rounded-14 border border-border-subtlest-secondary px-3 py-2 tablet:max-w-70">
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-text-tertiary typo-caption1">{label}</span>
      <span className="truncate text-text-primary typo-body">{value}</span>
    </span>
    {counter && (
      <span className="text-text-quaternary typo-callout">{counter}</span>
    )}
  </div>
);

const Block = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <span className="font-bold text-text-primary typo-body">{title}</span>
      {description && (
        <span className="text-text-tertiary typo-callout">{description}</span>
      )}
    </div>
    {children}
  </div>
);

const Divider = () => (
  <hr className="my-1 h-px border-0 bg-border-subtlest-tertiary" />
);

/**
 * FeedSettingsGeneralSection inside the feed settings modal. Feed name,
 * emoji picker, default-feed toggle, Happening Now placement and delete are
 * all `isCustomFeed`-gated already — the export belongs in the same set.
 */
const FeedSettingsScreen = ({
  device,
  spot,
}: {
  device: DeviceName;
  spot: Spot;
}) => (
  <Device name={device}>
    <div className="flex flex-col bg-background-popover">
      <div className="flex items-center gap-3 border-b border-border-subtlest-tertiary px-4 py-3">
        <HashtagIcon className="text-text-primary" />
        <span className="flex-1 font-bold text-text-primary typo-title3">
          My new feed
        </span>
        <Button size={ButtonSize.Small} variant={ButtonVariant.Tertiary}>
          Cancel
        </Button>
        <Button disabled size={ButtonSize.Small} variant={ButtonVariant.Primary}>
          Save
        </Button>
      </div>

      <div className="flex">
        {device !== 'Mobile' && (
          <nav className="flex w-56 shrink-0 flex-col gap-1 border-r border-border-subtlest-tertiary p-2">
            {MENU.map(([label, icon], index) => (
              <span
                key={label}
                className={`flex items-center gap-3 rounded-12 px-3 py-2 typo-callout ${
                  index === 0
                    ? 'bg-surface-float font-bold text-text-primary'
                    : 'text-text-tertiary'
                }`}
              >
                {icon}
                <span className="flex-1">{label}</span>
                <ArrowIcon className="rotate-90 text-text-quaternary" />
              </span>
            ))}
          </nav>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-6 p-4">
          <Block
            description="Choose a name that reflects the focus of your feed."
            title="Feed name"
          >
            <Field counter="39" label="Enter feed name" value="My new feed" />
          </Block>

          <Block title="Choose an icon">
            <Button
              className="w-fit"
              size={ButtonSize.Small}
              variant={ButtonVariant.Secondary}
            >
              Pick emoji
            </Button>
          </Block>

          <Block
            description="Make this feed the first one you see every time you open daily.dev."
            title="Set as your default feed"
          >
            <Button
              className="w-40"
              icon={<StarIcon />}
              size={ButtonSize.Small}
              variant={ButtonVariant.Secondary}
            >
              Make default
            </Button>
          </Block>

          {spot !== 'today' && (
            <>
              <Divider />
              <Block
                description="Anyone who opens your link gets this feed added to their own, tags and sources included."
                title="Share this feed"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 rounded-14 border border-border-subtlest-secondary px-3 py-2 tablet:max-w-70">
                    <span className="min-w-0 flex-1 truncate text-text-primary typo-body">
                      dly.to/f/tomer-frontend
                    </span>
                    <Button
                      icon={<LinkIcon />}
                      size={ButtonSize.Small}
                      variant={ButtonVariant.Primary}
                    >
                      Copy link
                    </Button>
                  </div>
                  {spot === 'list' && (
                    <Button
                      className="w-fit"
                      icon={<CopyIcon />}
                      size={ButtonSize.Small}
                      variant={ButtonVariant.Float}
                    >
                      Copy top 20 as a list
                    </Button>
                  )}
                </div>
              </Block>
            </>
          )}

          <Divider />

          <Block
            description="Choose where the Happening Now card appears in your feed, or hide it entirely."
            title="Happening Now placement"
          >
            <div className="flex w-full items-center gap-2 rounded-14 bg-surface-float px-3 py-3 tablet:max-w-70">
              <span className="flex-1 text-text-primary typo-body">
                Default
              </span>
              <ArrowIcon className="rotate-180 text-text-tertiary" />
            </div>
          </Block>

          <Divider />

          <Block
            description="Permanently remove this feed and all its settings. This action cannot be undone."
            title="Delete feed"
          >
            <Button
              className="w-40"
              icon={<TrashIcon />}
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
            >
              Delete feed
            </Button>
          </Block>
        </div>
      </div>
    </div>
  </Device>
);


/* ------------------------------------------------------- the recipient side */

type LandingSpot = 'preview' | 'added' | 'limit';

const TAGS = [
  '#typescript',
  '#react',
  '#webdev',
  '#css',
  '#nextjs',
  '#tooling',
];

/**
 * The recipient's landing. `/feeds/new?entityId=&entityType=` already creates
 * a feed and follows one entity into it — this is the same flow with a set
 * rather than a single tag, so the precedent exists in FeedSettingsCreate.
 */
const LandingScreen = ({
  device,
  spot,
}: {
  device: DeviceName;
  spot: LandingSpot;
}) => (
  <Device name={device}>
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <img alt="" className="size-14 rounded-full object-cover" src={AVATAR} />

      {spot === 'added' ? (
        <>
          <h1 className="font-bold text-text-primary typo-title2">
            Tomer&apos;s feed is yours now
          </h1>
          <p className="text-text-tertiary typo-callout">
            It is in your sidebar as a new feed. Rename it, add tags, or delete
            it — from here it is your feed, not a copy of theirs.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-bold text-text-primary typo-title2">
            Tomer shared a feed with you
          </h1>
          <p className="text-text-tertiary typo-callout">
            6 tags and 4 sources. Adding it creates a new feed in your account
            called <span className="text-text-primary">Tomer&apos;s feed</span>.
          </p>
        </>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {TAGS.slice(0, device === 'Mobile' ? 4 : 6).map((tag) => (
          <span
            key={tag}
            className="rounded-8 bg-surface-float px-2 py-1 text-text-tertiary typo-caption1"
          >
            {tag}
          </span>
        ))}
      </div>

      {spot === 'limit' && (
        <p className="rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3 text-text-tertiary typo-footnote">
          You have reached the maximum number of feeds. Free up a slot, or open
          it once without keeping it.
        </p>
      )}

      <div className="mt-2 flex flex-col items-center gap-2">
        {spot === 'added' ? (
          <Button size={ButtonSize.Medium} variant={ButtonVariant.Primary}>
            Open the feed
          </Button>
        ) : (
          <>
            <Button
              disabled={spot === 'limit'}
              icon={<PlusIcon />}
              size={ButtonSize.Medium}
              variant={ButtonVariant.Primary}
            >
              Add to my feeds
            </Button>
            <Button size={ButtonSize.Small} variant={ButtonVariant.Tertiary}>
              Just show me the posts
            </Button>
          </>
        )}
      </div>

      <div className="mt-2 w-full flex flex-col gap-2 text-left">
        {[
          'Why iconic tech brands lost their dominance',
          'The case against microservices',
          'Postgres is all you need, again',
        ].map((title) => (
          <div key={title} className="flex items-center gap-3">
            <div className="size-10 shrink-0 rounded-10 bg-surface-float" />
            <span className="min-w-0 flex-1 truncate text-text-primary typo-footnote">
              {title}
            </span>
          </div>
        ))}
      </div>
    </div>
  </Device>
);

const LandingRails = ({ spot }: { spot: LandingSpot }) => (
  <Rail>
    <LandingScreen device="Desktop" spot={spot} />
    <LandingScreen device="Tablet" spot={spot} />
    <LandingScreen device="Mobile" spot={spot} />
  </Rail>
);

const Rails = ({ spot }: { spot: Spot }) => (
  <Rail>
    <FeedSettingsScreen device="Desktop" spot={spot} />
    <FeedSettingsScreen device="Tablet" spot={spot} />
    <FeedSettingsScreen device="Mobile" spot={spot} />
  </Rail>
);

const CopyMyFeed = () => (
  <SurfacePage
    intro="Custom feeds only, and not a snapshot. A custom feed is something you built — a name, an icon, a tag set — so the thing worth sending is the feed itself, not a picture of its posts. Opening a shared link adds the feed to the recipient's account, named after whoever shared it."
    map="Revised from the sharing map (#6362), which had this down as snapshot-only on the assumption there was nothing to link to. There is, if the link creates something: Copy link leads, with a text list as the fallback for anywhere a link will not do."
    title="Share my feed"
  >
    <Category
      covers="FeedSettingsGeneralSection.tsx · FeedSettingsMenu types.ts"
      title="The sharer: in the feed settings modal"
      verdict="The General tab already gates feed name, the emoji picker, the default-feed toggle and delete behind `isCustomFeed`. Sharing belongs in exactly that set — it is a property of a feed you built, configured where everything else about it is configured."
    >
      <Variant
        headline="Name, icon, default, placement, delete"
        note="Seven tabs down the left, General open. Every custom-feed-only block already lives here, and none of them offers a way to get the feed out."
        step="Today"
      >
        <Rails spot="today" />
      </Variant>
      <Variant
        headline="A share link, with what it does stated"
        note="Recommended. The description does the work: ‘anyone who opens your link gets this feed added to their own’. Without that sentence a feed link reads as a link to your private feed, which is the one thing it cannot be."
        step="Recommended"
      >
        <Rails spot="section" />
      </Variant>
      <Variant
        headline="Plus a text list, for where a link will not do"
        note="The top 20 posts as plain text, for a Slack channel or a newsletter — the original #6362 idea, kept as the fallback rather than the feature. Float weight, because the link is the offer."
        step="Also"
      >
        <Rails spot="list" />
      </Variant>
    </Category>

    <Category
      covers="FeedSettingsCreate.tsx · CREATE_FEED_MUTATION · needs backend"
      title="The recipient: opening the link"
      verdict="This is the part that makes it worth building, and the pattern already exists: /feeds/new?entityId=&entityType= creates a feed and follows one entity into it. A shared feed is the same flow with a set instead of a single tag — plus a way for a non-owner to read the feed's tags and sources, which is the backend work."
    >
      <Variant
        headline="Tomer shared a feed with you"
        note="Names what will happen before it happens: a new feed called ‘Tomer's feed’, with 6 tags and 4 sources. ‘Just show me the posts’ is the escape hatch for anyone who wants to look without keeping it."
        step="Preview"
      >
        <LandingRails spot="preview" />
      </Variant>
      <Variant
        headline="Added, and now theirs"
        note="The copy has to make ownership obvious — rename it, add tags, delete it. A feed that still feels like someone else's is one people leave untouched and never open again."
        step="Added"
      >
        <LandingRails spot="added" />
      </Variant>
      <Variant
        headline="Out of feed slots"
        note="A real failure state, not an edge case: custom feeds are capped and FeedSettingsCreate already handles the limit error. A shared link that dead-ends here wastes the share, so it still offers the read-only view."
        step="Feed limit"
      >
        <LandingRails spot="limit" />
      </Variant>
    </Category>

    <Category
      covers="open questions"
      title="What this needs before it can ship"
      verdict="Four things, and only the first is frontend work. Worth naming now because the recipient flow is what makes the share worth anything, and three of the four are not ours to build."
    >
      <Variant
        headline="A shareable representation of a private feed"
        note="Feeds are user-scoped today. Sharing one needs a token or slug that resolves to its tags and sources for someone who does not own it — read-only, revocable, and not leaking the feed's name or the owner's other feeds. That is the whole feature, and it is backend."
        step="1 · Backend"
      >
        <div />
      </Variant>
      <Variant
        headline="A clone mutation, not a live subscription"
        note="Decide once: is the recipient's feed a copy taken at that moment, or does it track the original? A copy is simpler, matches ‘from here it is your feed’, and avoids someone's edits silently changing other people's feeds. Recommended: copy."
        step="2 · Product"
      >
        <div />
      </Variant>
      <Variant
        headline="What a logged-out visitor sees"
        note="A feed link will land on people without accounts — that is the point of sharing it. They need the read-only post list and a signup path that keeps the feed waiting for them, or the best shares in the flow are the ones that convert worst."
        step="3 · Product"
      >
        <div />
      </Variant>
      <Variant
        headline="Plus gating and the feed cap"
        note="Custom feeds are limited. If a shared feed consumes a slot, heavy sharers hit the cap first — the people the feature depends on. Worth deciding whether an added feed counts against the limit before the link exists."
        step="4 · Product"
      >
        <div />
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof CopyMyFeed> = {
  title: 'Features/Snapshot/Surfaces/Copy my feed',
  component: CopyMyFeed,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof CopyMyFeed> = {};
