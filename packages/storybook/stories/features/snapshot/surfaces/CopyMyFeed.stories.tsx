import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  AiIcon,
  AlertIcon,
  ArrowIcon,
  BlockIcon,
  CopyIcon,
  EditIcon,
  FilterIcon,
  HashtagIcon,
  LinkIcon,
  MiniCloseIcon,
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

type Spot = 'section' | 'list';

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
        <Button
          disabled
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
        >
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

type LandingSpot = 'preview' | 'added' | 'signin' | 'limit';

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

      {spot === 'added' && (
        <>
          <h1 className="font-bold text-text-primary typo-title2">
            Tomer&apos;s feed is yours now
          </h1>
          <p className="text-text-tertiary typo-callout">
            It is in your sidebar as a new feed. Rename it, add tags, or delete
            it — from here it is your feed, not a copy of theirs.
          </p>
        </>
      )}
      {spot === 'signin' && (
        <>
          <h1 className="font-bold text-text-primary typo-title2">
            Sign in to add Tomer&apos;s feed
          </h1>
          <p className="text-text-tertiary typo-callout">
            A feed lives in an account, so there is nowhere to put this one yet.
            Sign in or sign up, then open the link again.
          </p>
        </>
      )}
      {(spot === 'preview' || spot === 'limit') && (
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

      <div className="mt-2 flex flex-col items-center gap-2">
        {spot === 'added' && (
          <Button size={ButtonSize.Medium} variant={ButtonVariant.Primary}>
            Open the feed
          </Button>
        )}
        {spot === 'signin' && (
          <Button size={ButtonSize.Medium} variant={ButtonVariant.Primary}>
            Sign in
          </Button>
        )}
        {(spot === 'preview' || spot === 'limit') && (
          <Button
            icon={<PlusIcon />}
            size={ButtonSize.Medium}
            variant={ButtonVariant.Primary}
          >
            Add to my feeds
          </Button>
        )}
      </div>

      {spot === 'limit' && (
        <div className="invert mt-2 flex w-full flex-row items-center gap-2.5 rounded-12 border border-border-subtlest-tertiary bg-background-default py-2 pl-3 pr-2 shadow-3">
          <AlertIcon className="shrink-0 text-status-error" />
          <span className="min-w-0 flex-1 text-left font-medium text-text-primary typo-subhead">
            You&apos;ve reached the maximum number of feeds. Delete one or
            upgrade to Plus to add this feed.
          </span>
          <Button
            aria-label="Close"
            icon={<MiniCloseIcon />}
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
          />
        </div>
      )}

      {/* A sample of what the feed holds, not a reading surface: nothing here
          is a link, so the only way in is to add the feed. */}
      <div
        aria-hidden
        className="mt-2 flex w-full flex-col gap-2 text-left opacity-60 pointer-events-none"
      >
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
        note="Names what will happen before it happens: a new feed called ‘Tomer's feed’, with 6 tags and 4 sources. One action only — the posts underneath are a sample of what the feed holds, dimmed and not pressable, so adding the feed is the only way in."
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
        headline="Not signed in"
        note="Decided: a feed lives in an account, so there is nowhere to put a shared one without a session. Sign in or sign up, then open the link again. No read-only preview — which is also why the sample posts below are not links."
        step="No session"
      >
        <LandingRails spot="signin" />
      </Variant>
      <Variant
        headline="Out of feed slots — an error toast"
        note="Decided: the button stays live and the failure comes back as an error toast that says why, naming both ways out. Nothing is disabled up front — we cannot know the recipient is at their cap until they press, and a dead button explains nothing. FeedSettingsCreate already turns this API error into a toast today."
        step="Feed limit"
      >
        <LandingRails spot="limit" />
      </Variant>
    </Category>

    <Category
      covers="decisions and what is still open"
      title="Decisions"
      verdict="All four answered. Only the first is work we do not own — the rest are product calls, now made."
    >
      <Variant
        headline="A shareable representation of a private feed"
        note="Still the whole feature, and it is backend. Feeds are user-scoped today, so sharing one needs a token or slug that resolves to its tags and sources for someone who does not own it — read-only, revocable, and not leaking the owner's other feeds."
        step="1 · Backend"
      >
        <div />
      </Variant>
      <Variant
        headline="A copy, taken at the moment it is added"
        note="Decided. Not a live subscription: the recipient's feed is theirs to rename and edit from the moment they add it, and the sharer's later edits never reach into other people's accounts. It also means the sharer can delete their feed without breaking anyone else's."
        step="2 · Decided"
      >
        <div />
      </Variant>
      <Variant
        headline="Sign-in required, no logged-out preview"
        note="Decided. Anyone without a session gets the sign-in state above and opens the link again afterwards. Worth building the redirect back to the link into the auth flow anyway — asking someone to find the message again is where most of them will drop."
        step="3 · Decided"
      >
        <div />
      </Variant>
      <Variant
        headline="An added feed uses a feed slot"
        note="Decided: it counts, like any feed you made yourself, and hitting the cap surfaces as the error toast above rather than a special case. One kind of feed, one limit, one message. Worth watching once it ships: heavy recipients are the same people the feature spreads through, so if the cap starts biting them we will see it in add-rate before anyone reports it."
        step="4 · Decided"
      >
        <div />
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof CopyMyFeed> = {
  title: 'Features/Snapshot/Surfaces/Share my feed',
  component: CopyMyFeed,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof CopyMyFeed> = {};
