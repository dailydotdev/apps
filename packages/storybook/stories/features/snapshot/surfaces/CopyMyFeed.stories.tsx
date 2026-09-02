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
  EditIcon,
  FilterIcon,
  HashtagIcon,
  PlusUserIcon,
  StarIcon,
  TrashIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { DeviceName } from '../surfaceChrome';
import {
  Category,
  Control,
  Device,
  Rail,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

type Spot = 'today' | 'section' | 'lead';

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
                description="Turn the top posts in this feed into a card you can post anywhere. Only you can open the feed itself."
                title="Share this feed"
              >
                <Control
                  action="Snapshot"
                  className="w-40"
                  label
                  variant={
                    spot === 'lead'
                      ? ButtonVariant.Primary
                      : ButtonVariant.Secondary
                  }
                />
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

const Rails = ({ spot }: { spot: Spot }) => (
  <Rail>
    <FeedSettingsScreen device="Desktop" spot={spot} />
    <FeedSettingsScreen device="Tablet" spot={spot} />
    <FeedSettingsScreen device="Mobile" spot={spot} />
  </Rail>
);

const CopyMyFeed = () => (
  <SurfacePage
    intro="Custom feeds only. A custom feed is something you built — a name, an icon, a tag set — which is what makes it worth showing someone; the main For You feed is generated, personal, and not an artifact anyone chose to make. There is no URL either way: your feed is yours, so an image is the only shareable shape it has."
    map="Sharing map: Snapshot leads (#6362). Copy link is not a secondary option here, it is absent — there is nothing for a recipient to open."
    title="Copy my feed"
  >
    <Category
      covers="FeedSettingsGeneralSection.tsx · FeedSettingsMenu types.ts"
      title="In the feed settings modal"
      verdict="The General tab already gates feed name, the emoji picker, the default-feed toggle and delete behind `isCustomFeed`. An export belongs in exactly that set — it is a property of a feed you built, configured where everything else about it is configured, rather than a control bolted onto the feed header."
    >
      <Variant
        headline="Name, icon, default, placement, delete"
        note="Seven tabs down the left, General open. Every custom-feed-only block already lives here, and none of them offers a way to get the feed out."
        step="Today"
      >
        <Rails spot="today" />
      </Variant>
      <Variant
        headline="A ‘Share this feed’ block"
        note="Recommended. Sits between the default-feed toggle and Happening Now placement, matched to the Small Secondary buttons around it. The description carries the constraint that makes snapshot the only option: only you can open the feed itself."
        step="Recommended"
      >
        <Rails spot="section" />
      </Variant>
      <Variant
        headline="Filled, to announce the capability"
        note="A block nobody is looking for in a modal nobody opens twice. Worth shipping Primary for the first weeks, then quietening it once the feature is known."
        step="Push"
      >
        <Rails spot="lead" />
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
