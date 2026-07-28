import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { EntityShareAction } from '@dailydotdev/shared/src/components/share/EntityShareAction';
import { ShareActions } from '@dailydotdev/shared/src/components/share/ShareActions';
import CustomFeedOptionsMenu from '@dailydotdev/shared/src/components/CustomFeedOptionsMenu';
import { MenuIcon } from '@dailydotdev/shared/src/components/MenuIcon';
import SourceActionsFollow from '@dailydotdev/shared/src/components/sources/SourceActions/SourceActionsFollow';
import SourceActionsNotify from '@dailydotdev/shared/src/components/sources/SourceActions/SourceActionsNotify';
import SourceActionsBlock from '@dailydotdev/shared/src/components/sources/SourceActions/SourceActionsBlock';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BellAddIcon,
  BellSubscribedIcon,
  BlockIcon,
  MiniCloseIcon as XIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { GrowthBookProvider } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';
import { getShortLinkProps } from '@dailydotdev/shared/src/hooks/utils/useGetShortUrl';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';

const mockUser = {
  id: '1',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  image: 'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
  providers: ['google'],
  createdAt: '2024-01-01T00:00:00.000Z',
  permalink: 'https://daily.dev/testuser',
} as unknown as LoggedUser;

const SHORT_LINK = 'https://dly.to/abc123';

type Entity = 'tag' | 'source';

/**
 * Tag page: `default` shows Follow + Block, `following` drops Block, `blocked`
 * drops Follow. The source page follows the same three-way split.
 */
type EntityState = 'default' | 'following' | 'blocked';

const entityConfig: Record<
  Entity,
  {
    link: string;
    text: string;
    cid: ReferralCampaignKey;
    event: LogEvent;
    targetId: string;
    origin: Origin;
  }
> = {
  tag: {
    link: 'https://app.daily.dev/tags/webdev',
    text: 'Check out the webdev tag on daily.dev',
    cid: ReferralCampaignKey.ShareTag,
    event: LogEvent.ShareTag,
    targetId: 'webdev',
    origin: Origin.TagPage,
  },
  source: {
    link: 'https://app.daily.dev/sources/tds',
    text: 'Check out tds on daily.dev',
    cid: ReferralCampaignKey.ShareSource,
    event: LogEvent.ShareSource,
    targetId: 'tds',
    origin: Origin.SourcePage,
  },
};

/**
 * `current` is the row as it was before this change: a Block button in the row
 * and an icon-only share behind a vertical rule. Kept for comparison only.
 * `proposed` is what both pages ship now — Block in the "…" menu, a labelled
 * "Copy link" with a chevron, and the bell styled like the "…" button.
 */
type Layout = 'current' | 'proposed';

const menuProps = (
  entity: Entity,
  { layout, state }: { layout: Layout; state: EntityState },
) => ({
  onAdd: fn(),
  onUndo: fn(),
  onCreateNewFeed: fn(),
  shareProps: {
    text: entityConfig[entity].text,
    link: entityConfig[entity].link,
    cid: entityConfig[entity].cid,
  },
  // Block leaves the row and becomes a menu entry in the proposed layout —
  // except while blocked, where Unblock stays in the row as the visible way out
  // of a state the user did not necessarily mean to be in. Burying the only
  // escape behind "…" is what makes a blocked entity feel stuck.
  additionalOptions:
    layout === 'proposed' && state !== 'blocked'
      ? [
          {
            icon: <MenuIcon Icon={BlockIcon} />,
            label: 'Block',
            action: fn(),
          },
        ]
      : [],
});

// Every secondary control in the row is the same button: Float, size Small,
// icon-only. The bell is the only one that also carries a state.
const RowIconButton = ({
  icon,
  label,
}: {
  icon: ReactElement;
  label: string;
}): ReactElement => (
  <Button
    type="button"
    size={ButtonSize.Small}
    variant={ButtonVariant.Float}
    icon={icon}
    aria-label={label}
    title={label}
    onClick={fn()}
  />
);

interface RowProps {
  state: EntityState;
  layout?: Layout;
}

// Mirrors the `/tags/[tag]` header action row (`TagTopicPage`): same icons,
// same variants, same `gap-3`, same show/hide rules.
const TagActionRow = ({
  state,
  layout = 'proposed',
}: RowProps): ReactElement => {
  const isCurrent = layout === 'current';

  return (
    <div className="inline-flex flex-row items-center gap-3">
      {state !== 'blocked' && (
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          icon={state === 'following' ? <XIcon /> : <PlusIcon />}
          aria-label={state === 'following' ? 'Unfollow' : 'Follow'}
        >
          {state === 'following' ? 'Following' : 'Follow'}
        </Button>
      )}
      {/* Blocked keeps Unblock in the row in both layouts — it is the only way
          back, so it never goes behind the "…" menu. */}
      {(state === 'blocked' || (isCurrent && state !== 'following')) && (
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
          icon={state === 'blocked' ? <XIcon /> : <BlockIcon />}
          aria-label={state === 'blocked' ? 'Unblock' : 'Block'}
        >
          {state === 'blocked' ? 'Unblock' : 'Block'}
        </Button>
      )}
      <EntityShareAction
        {...entityConfig.tag}
        display={isCurrent ? 'icon' : 'split'}
      />
      <CustomFeedOptionsMenu
        hideShare
        {...menuProps('tag', { layout, state })}
      />
    </div>
  );
};

interface SourceActionRowProps extends RowProps {
  /** Only reachable while following: the bell toggles subscribed / not. */
  notificationsOn?: boolean;
  /** `/sources/[source]` passes `showShare`; embedded consumers don't. */
  showShare?: boolean;
}

// Mirrors `SourceActions` (rendered inside `PageInfoHeader` on the source page):
// same child components, same `gap-2`, same show/hide rules.
const SourceActionRow = ({
  state,
  notificationsOn = false,
  showShare = true,
  layout = 'proposed',
}: SourceActionRowProps): ReactElement => {
  const isCurrent = layout === 'current';

  return (
    <div className="inline-flex flex-row items-center gap-2">
      {state !== 'blocked' && (
        <SourceActionsFollow
          isFetching={false}
          isSubscribed={state === 'following'}
          onClick={fn()}
          variant={ButtonVariant.Primary}
        />
      )}
      {isCurrent && state === 'following' && (
        <SourceActionsNotify
          haveNotificationsOn={notificationsOn}
          onClick={fn()}
        />
      )}
      {/* Blocked keeps Unblock in the row in both layouts — it is the only way
          back, so it never goes behind the "…" menu. In the proposed layout it
          takes the Follow slot, which is empty while blocked. */}
      {(state === 'blocked' || (isCurrent && state !== 'following')) && (
        <SourceActionsBlock isBlocked={state === 'blocked'} onClick={fn()} />
      )}
      {showShare && (
        <EntityShareAction
          {...entityConfig.source}
          display={isCurrent ? 'icon' : 'split'}
        />
      )}
      {!isCurrent && state === 'following' && (
        <RowIconButton
          icon={notificationsOn ? <BellSubscribedIcon /> : <BellAddIcon />}
          label={
            notificationsOn ? 'Disable notifications' : 'Enable notifications'
          }
        />
      )}
      <CustomFeedOptionsMenu
        hideShare={showShare}
        {...menuProps('source', { layout, state })}
      />
    </div>
  );
};

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex w-full flex-col gap-3">
    <div className="flex flex-col gap-1 border-b border-border-subtlest-tertiary pb-2">
      <Typography type={TypographyType.Title3} bold>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    </div>
    <div className="flex flex-row flex-wrap gap-4">{children}</div>
  </section>
);

const Case = ({
  label,
  note,
  wide = false,
  children,
}: {
  label: string;
  note?: string;
  /** Cases whose content is wider than a single action row. */
  wide?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-4',
      wide ? 'w-[34rem]' : 'w-80',
    )}
  >
    <Typography type={TypographyType.Footnote} bold>
      {label}
    </Typography>
    <div className="flex min-h-12 w-full flex-row flex-wrap items-center gap-y-2">
      {children}
    </div>
    {note && (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {note}
      </Typography>
    )}
  </div>
);

const INTERACTION_CHECKS = [
  'Click the “Copy link” label — it copies straight away and the copy glyph cross-fades into a green check for a second.',
  'Click the chevron — the DS dropdown opens with the social tiles and the chevron rotates to point back at it.',
  'Hover the two halves — one seam, not two borders meeting, and the whole control keeps a standard button’s height and radius.',
  'Hover the three secondary controls (copy link, bell, “…”) — same Float surface, same size, same hover.',
  'Open the “…” menu — Block lives there, under “Add to custom feed” (additionalOptions append; say the word if it should sit first).',
  'Block a tag or source — Unblock comes back out into the row and leaves the menu, so the way back is never buried.',
  'Switch the toolbar viewport to a mobile size — the chevron and the dropdown drop; a single tap opens the native share sheet.',
  'Toggle the toolbar theme — the row and the dropdown have to hold contrast in dark mode.',
];

// Every state the promoted share control can be seen in, on one page.
const Overview = (): ReactElement => (
  <div className="flex w-full max-w-[76rem] flex-col gap-10">
    <Section
      title="Before / after"
      description="What shipped: Block moved into the “…” menu, the icon-only share became a labelled “Copy link” whose chevron opens the full share list, and the bell took the same Float treatment as “…” — so every secondary control is one button."
    >
      <Case
        wide
        label="Before"
        note="Follow · Block · | · share icon · … — three different button treatments in one row"
      >
        <SourceActionRow state="following" notificationsOn layout="current" />
      </Case>
      <Case
        wide
        label="After — live on both pages"
        note="Follow · Copy link ▾ · bell · … — one named action, then identical icon buttons"
      >
        <SourceActionRow state="following" notificationsOn />
      </Case>
    </Section>

    <Section
      title="Tag page — /tags/[tag]"
      description="TagTopicPage header row (gap-3). Block moves into the “…” menu, so the row holds one Follow button plus identical secondary controls — except while blocked, where Unblock takes the empty Follow slot."
    >
      <Case
        label="Default — not followed"
        note="Follow · Copy link ▾ · … — Block is inside the menu"
      >
        <TagActionRow state="default" />
      </Case>
      <Case label="Following" note="Identical row; Block stays in the menu">
        <TagActionRow state="following" />
      </Case>
      <Case
        label="Blocked"
        note="Follow is dropped by the real row, so Unblock takes its slot — and leaves the menu"
      >
        <TagActionRow state="blocked" />
      </Case>
    </Section>

    <Section
      title="Source page — /sources/[source]"
      description="SourceActions inside PageInfoHeader (gap-2). The bell only exists while following and now matches the “…” button exactly."
    >
      <Case label="Default — not followed" note="Follow · Copy link ▾ · …">
        <SourceActionRow state="default" />
      </Case>
      <Case label="Following · notifications off">
        <SourceActionRow state="following" />
      </Case>
      <Case
        label="Following · notifications on"
        note="Densest row: Following · Copy link ▾ · bell · …"
      >
        <SourceActionRow state="following" notificationsOn />
      </Case>
      <Case
        label="Blocked"
        note="Unblock takes the empty Follow slot and leaves the menu"
      >
        <SourceActionRow state="blocked" />
      </Case>
    </Section>

    <Section
      title="Who gets it"
      description="No feature flag — the header treatment ships to everyone. The only switch left is the `showShare` prop, which SourceActions consumers use to opt in; embedded consumers keep the row they have today."
    >
      <Case
        label="Source page header — showShare"
        note="Copy link in the row, Block inside the “…” menu"
      >
        <SourceActionRow state="default" />
      </Case>
      <Case
        label="Embedded consumer — post page"
        note="No showShare: Block stays a row button and Share stays in the menu"
      >
        <SourceActionRow state="default" showShare={false} />
      </Case>
      <Case
        label="Tag page header"
        note="Always on — the tag page has no opt-out prop"
      >
        <TagActionRow state="default" />
      </Case>
    </Section>

    <Section
      title="The copy control"
      description="The exact SplitShareButton from the end-of-conversation band (PR #6369): the label copies and cross-fades to a green check, the chevron opens the DS dropdown with the social tiles and rotates to point back at it. See Components/Share/SplitShareButton for its own variant/size matrix and the geometry check."
    >
      <Case
        label="split — what the rows use"
        note="Left half copies; right half drops the list. Float, size Small."
      >
        <EntityShareAction {...entityConfig.tag} display="split" />
      </Case>
      <Case
        label="icon — the alternative display"
        note="Unlabelled, so it needs the vertical rule to stay distinct from Follow, and it opens a Popover rather than the dropdown"
      >
        <div className="inline-flex flex-row items-center gap-3">
          <EntityShareAction {...entityConfig.tag} display="icon" />
        </div>
      </Case>
      <Case
        wide
        label="What the chevron opens"
        note="The same social tiles, rendered inline: copy link first, then the networks"
      >
        <ShareActions
          variant="inline"
          link={entityConfig.tag.link}
          text={entityConfig.tag.text}
          cid={entityConfig.tag.cid}
          onShare={fn()}
        />
      </Case>
      <Case
        wide
        label="Next to Follow — Tertiary vs Float vs Subtle"
        note="Each variant draws the seam differently: Float/Subtle reuse the DS border, Tertiary draws an inset rule"
      >
        <div className="flex flex-row items-center gap-3">
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            icon={<PlusIcon />}
          >
            Follow
          </Button>
          {[
            ButtonVariant.Tertiary,
            ButtonVariant.Float,
            ButtonVariant.Subtle,
          ].map((variant) => (
            <ShareActions
              key={variant}
              variant="split"
              link={entityConfig.tag.link}
              text={entityConfig.tag.text}
              buttonVariant={variant}
              label="Copy link"
              triggerText="Copy link"
              onShare={fn()}
            />
          ))}
        </div>
      </Case>
    </Section>

    <Section
      title="Interactions to check by hand"
      description="Driven by real interaction, so they can't be rendered statically above."
    >
      <ul className="flex list-disc flex-col gap-1 pl-5">
        {INTERACTION_CHECKS.map((item) => (
          <li key={item}>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              {item}
            </Typography>
          </li>
        ))}
      </ul>
    </Section>
  </div>
);

interface PlaygroundProps {
  entity: Entity;
  state: EntityState;
  notificationsOn: boolean;
  layout: Layout;
}

const Playground = ({
  entity,
  state,
  notificationsOn,
  layout,
}: PlaygroundProps): ReactElement =>
  entity === 'tag' ? (
    <TagActionRow state={state} layout={layout} />
  ) : (
    <SourceActionRow
      state={state}
      notificationsOn={notificationsOn}
      layout={layout}
    />
  );

const withProviders = (Story: React.ComponentType): ReactElement => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });

  // Seed the resolved short URL for both campaigns so nothing hits network.
  [ReferralCampaignKey.ShareTag, ReferralCampaignKey.ShareSource].forEach(
    (cid) => {
      Object.values(entityConfig).forEach((config) => {
        const { queryKey } = getShortLinkProps(config.link, cid, mockUser);
        queryClient.setQueryData(queryKey, SHORT_LINK);
      });
    },
  );

  const LogContext = getLogContextStatic();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={
          {
            user: mockUser,
            isLoggedIn: true,
            isAuthReady: true,
            tokenRefreshed: true,
            shouldShowLogin: false,
            showLogin: fn(),
            closeLogin: fn(),
            logout: fn(),
            updateUser: fn(),
            getRedirectUri: fn(),
            loadingUser: false,
            loadedUserFromCache: true,
            refetchBoot: fn(),
            squads: [],
            isAndroidApp: false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        }
      >
        <GrowthBookProvider
          app={BootApp.Webapp}
          user={mockUser}
          deviceId="storybook"
        >
          <LogContext.Provider
            value={{
              logEvent: fn(),
              logEventStart: fn(),
              logEventEnd: fn(),
              sendBeacon: () => false,
            }}
          >
            <div className="flex min-h-40 flex-col items-center justify-center p-4">
              <Story />
            </div>
          </LogContext.Provider>
        </GrowthBookProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

const meta: Meta<typeof Playground> = {
  title: 'Components/Share/EntityShareAction',
  component: Playground,
  decorators: [withProviders],
  parameters: {
    docs: {
      description: {
        component:
          'Promotes share out of the tag/source "…" options menu into the header action row as a labelled "Copy link" button whose chevron opens the full share list (the SplitShareButton from PR #6369). Block moves into the "…" menu — except while blocked, where Unblock stays in the row. Ships to everyone: no feature flag.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Playground>;

/** Every surface, state and flag combination on one page. Start here. */
export const AllStates: StoryObj = {
  render: () => <Overview />,
  parameters: { controls: { disable: true } },
};

/** Drive a single row from the controls panel. */
export const InteractivePlayground: Story = {
  args: {
    entity: 'tag',
    state: 'default',
    notificationsOn: false,
    layout: 'proposed',
  },
  argTypes: {
    entity: { control: 'inline-radio', options: ['tag', 'source'] },
    state: {
      control: 'inline-radio',
      options: ['default', 'following', 'blocked'],
    },
    layout: {
      control: 'inline-radio',
      options: ['proposed', 'current'],
      description:
        'proposed = Copy link ▾ with Block in the menu; current = what the PR ships',
    },
    notificationsOn: {
      control: 'boolean',
      description: 'Source page only, and only while following',
    },
  },
};

export const TagDefault: StoryObj = {
  render: () => <TagActionRow state="default" />,
};

export const TagFollowing: StoryObj = {
  render: () => <TagActionRow state="following" />,
};

export const TagBlocked: StoryObj = {
  render: () => <TagActionRow state="blocked" />,
};

export const SourceDefault: StoryObj = {
  render: () => <SourceActionRow state="default" />,
};

export const SourceFollowing: StoryObj = {
  render: () => <SourceActionRow state="following" />,
};

/** Densest row: Following + Copy link ▾ + bell + "…". */
export const SourceFollowingWithNotifications: StoryObj = {
  render: () => <SourceActionRow state="following" notificationsOn />,
};

/** The row as the PR ships it today, for side-by-side comparison. */
export const CurrentLayout: StoryObj = {
  render: () => (
    <SourceActionRow state="following" notificationsOn layout="current" />
  ),
};

export const SourceBlocked: StoryObj = {
  render: () => <SourceActionRow state="blocked" />,
};

/**
 * `SourceActions` is also rendered on the post page without `showShare`, so it
 * keeps the row it has today: Block as a button, Share inside the "…" menu.
 */
export const EmbeddedConsumerOptedOut: StoryObj = {
  render: () => <SourceActionRow state="default" showShare={false} />,
};

/** Mobile: a single tap opens the native share sheet instead of the popover. */
export const TagMobile: StoryObj = {
  render: () => <TagActionRow state="following" />,
  globals: { viewport: { value: 'mobile1' } },
};

/** The popover's contents, rendered inline. */
export const SharePopoverContents: StoryObj = {
  render: () => (
    <ShareActions
      variant="inline"
      link={entityConfig.tag.link}
      text={entityConfig.tag.text}
      cid={entityConfig.tag.cid}
      onShare={fn()}
    />
  ),
};
