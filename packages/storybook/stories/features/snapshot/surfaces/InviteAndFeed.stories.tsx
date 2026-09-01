import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons';
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

type Spot = 'today' | 'snapshot' | 'lead';

/* ------------------------------------------------------------------ invite */

const TARGETS = [
  ['X', 'bg-text-primary'],
  ['WhatsApp', 'bg-accent-avocado-default'],
  ['Facebook', 'bg-accent-bun-default'],
  ['Reddit', 'bg-accent-ketchup-default'],
  ['LinkedIn', 'bg-accent-blueCheese-default'],
  ['Telegram', 'bg-accent-water-default'],
  ['Email', 'bg-accent-burger-default'],
];

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) => (
  <section className="flex flex-col gap-1">
    <h2 className="font-bold text-text-primary typo-body">{title}</h2>
    <p className="text-text-tertiary typo-callout">{description}</p>
    {children}
  </section>
);

/**
 * /settings/invite: three AccountContentSections. The link comes as a
 * TextField labelled "Your unique invite URL" with a Primary Copy link
 * action button, then "or invite via" and the SocialShareList row.
 */
const InviteScreen = ({ device }: { device: DeviceName }) => (
  <Device name={device}>
    <div className="flex flex-col gap-6 p-4">
      <h1 className="font-bold text-text-primary typo-title2">
        Invite friends
      </h1>

      <Section
        description="Share daily.dev with developers you know. When they join through your link, they'll show up in your referrals list below."
        title="Grow the community"
      />

      <Section
        description="Copy your personal link or share it directly on social platforms."
        title="Share your invite link"
      >
        <div className="mt-4 flex flex-col gap-1">
          <span className="text-text-tertiary typo-caption1">
            Your unique invite URL
          </span>
          <div className="flex items-center gap-2 rounded-14 border border-border-subtlest-secondary px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-text-primary typo-body">
              dly.to/tomer
            </span>
            <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
              Copy link
            </Button>
          </div>
        </div>

        <span className="my-4 block p-0.5 font-bold text-text-tertiary typo-callout">
          or invite via
        </span>

        <div className="flex flex-row flex-wrap gap-2 gap-y-4">
          {TARGETS.slice(0, device === 'Mobile' ? 5 : 7).map(
            ([label, tone]) => (
              <div key={label} className="flex w-16 flex-col items-center gap-1">
                <span className={`size-10 rounded-full ${tone}`} />
                <span className="text-text-tertiary typo-caption2">
                  {label}
                </span>
              </div>
            ),
          )}
        </div>
      </Section>

      <Section
        description="Developers who joined through your invite link"
        title="Your referrals"
      >
        <div className="mt-3 flex flex-col gap-2">
          {['Bobby Iliev', 'Ante Barić'].map((name) => (
            <div key={name} className="flex items-center gap-3">
              <img
                alt=""
                className="size-8 rounded-full object-cover"
                src={AVATAR}
              />
              <span className="text-text-primary typo-callout">{name}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  </Device>
);

/* -------------------------------------------------------------- copy feed */

const FeedScreen = ({ device, spot }: { device: DeviceName; spot: Spot }) => (
  <Device name={device}>
    <div className="flex flex-col gap-3 p-4">
      <div className="relative flex items-center gap-2">
        <h1 className="flex-1 font-bold text-text-primary typo-title2">
          My feed
        </h1>
        {spot === 'snapshot' && <Control action="Snapshot" />}
        {spot === 'lead' && (
          <Control action="Snapshot" label variant={ButtonVariant.Primary} />
        )}
        <Button
          aria-label="Feed settings"
          icon={<MenuIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
        {spot === 'today' && (
          <OverflowMenu
            className="right-0 top-9"
            items={['Feed settings', 'Manage tags']}
          />
        )}
      </div>

      {[
        'Why iconic tech brands lost their dominance',
        'The case against microservices',
        'Postgres is all you need, again',
      ].map((title) => (
        <div key={title} className="flex items-center gap-3">
          <div className="size-12 shrink-0 rounded-12 bg-surface-float" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-text-primary typo-callout">
              {title}
            </span>
            <span className="text-text-tertiary typo-footnote">
              XDA Developers · 4 min read
            </span>
          </div>
        </div>
      ))}
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

const InviteAndFeed = () => (
  <SurfacePage
    intro="Two surfaces whose entire purpose is sending something outward, at opposite ends of the payload question. The invite is worthless without a clickable URL and already has a complete share UI, so it is here as a reference point. The feed export has no URL anyone else can open, and nothing at all."
    map="Sharing map: Copy link leads the invite (#6366) — an image of a referral cannot be clicked. Snapshot leads Copy my feed (#6362), because your feed is yours and there is nothing to link to."
    title="Invite & feed export"
  >
    <Category
      covers="pages/settings/invite.tsx · InviteLinkInput.tsx · SocialShareList.tsx"
      title="Invite friends"
      verdict="No change proposed. This page is already the most complete share UI in the product: a TextField labelled ‘Your unique invite URL’ with a Primary ‘Copy link’ action button, then ‘or invite via’ and the full seven-target social row. An image of a referral cannot be clicked, so snapshot has nothing to add here."
    >
      <Variant
        headline="Copy link, then seven targets"
        note="Note SocialShareList runs here without its own copy button — the TextField owns that job — so the row is targets only. The reward copy belongs to #6366's onboarding step, which is blocked on backend and does not exist on this page."
        step="Today"
      >
        <Rail>
          <InviteScreen device="Desktop" />
          <InviteScreen device="Tablet" />
          <InviteScreen device="Mobile" />
        </Rail>
      </Variant>
    </Category>

    <Category
      covers="#6362 · copy my feed · not built"
      title="Copy my feed"
      verdict="Nothing exists yet. The feed header carries settings and nothing else, so whatever ships here is the first share control on the surface rather than a promotion of a buried one."
    >
      <Variant
        headline="A settings menu, and no export"
        note="Your feed is the most personal thing in the product and it cannot leave in any form."
        step="Today"
      >
        <Rails Screen={FeedScreen} spot="today" />
      </Variant>
      <Variant
        headline="Snapshot in the feed header"
        note="Consistent with every other header control, and easy to miss on a surface where nobody is looking for it."
        step="Recommended"
      >
        <Rails Screen={FeedScreen} spot="snapshot" />
      </Variant>
      <Variant
        headline="Labeled and filled"
        note="A capability nobody is looking for has to announce itself once. Worth shipping labeled, then quietening it after the first weeks of discovery."
        step="Push"
      >
        <Rails Screen={FeedScreen} spot="lead" />
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof InviteAndFeed> = {
  title: 'Features/Snapshot/Surfaces/Invite & feed export',
  component: InviteAndFeed,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof InviteAndFeed> = {};
