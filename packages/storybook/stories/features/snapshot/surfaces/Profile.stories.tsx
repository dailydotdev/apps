import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  DownloadIcon,
  EditIcon,
  MedalBadgeIcon,
  ReputationIcon,
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

/* ------------------------------------------------------------------ header */

/**
 * ProfileHeader: an h-36 cover, a 7.5rem rounded-16 avatar pinned at
 * `left-6 top-16`, then a right-aligned action row above the name. The
 * snapshot button already ships here, matched to the edit button at Medium
 * Float.
 */
const ProfileScreen = ({ device }: { device: DeviceName }) => (
  <Device name={device}>
    <div className="relative w-full overflow-hidden">
      <div className="h-36 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default" />
      <img
        alt=""
        className="absolute left-6 top-16 size-[7.5rem] rounded-16 border-4 border-background-default object-cover"
        src={AVATAR}
      />

      <div className="flex flex-col gap-3 px-6">
        <div className="mb-4 ml-auto mt-2 flex items-center gap-2">
          <Button
            aria-label="Edit profile"
            icon={<EditIcon />}
            size={ButtonSize.Medium}
            variant={ButtonVariant.Float}
          />
          <Control
            action="Snapshot"
            size={ButtonSize.Medium}
            variant={ButtonVariant.Float}
          />
          <Control
            action="Link"
            size={ButtonSize.Medium}
            variant={ButtonVariant.Float}
          />
        </div>

        <span className="font-bold text-text-primary typo-title2">
          Tomer Redlich
        </span>

        <div className="flex flex-col gap-2">
          <p className="text-text-primary typo-body">
            Building the feed developers actually read.
          </p>
          <span className="text-text-secondary typo-subhead">Tel Aviv</span>
          <span className="text-text-secondary typo-subhead">
            @tomer · Joined Jan 4. 2021
          </span>

          <div className="-ml-1 grid w-fit grid-cols-[auto_auto] gap-x-2 gap-y-1 pb-4 text-text-tertiary typo-footnote">
            <span className="flex items-center gap-1">
              <ReputationIcon className="text-accent-onion-default" />
              <b className="text-text-primary typo-subhead">1.2K</b> Reputation
            </span>
            <span>
              <b className="text-text-primary typo-subhead">3.4K</b> Upvotes
            </span>
            <span className="pl-6">
              <b className="text-text-primary typo-subhead">842</b> Followers
            </span>
            <span>
              <b className="text-text-primary typo-subhead">61</b> Following
            </span>
          </div>
        </div>
      </div>
    </div>
  </Device>
);

/* ----------------------------------------------------------------- widgets */

const SummaryCard = ({ count, label }: { count: string; label: string }) => (
  <div className="flex flex-1 flex-col rounded-12 bg-surface-float p-3">
    <span className="font-bold text-text-primary typo-title3">{count}</span>
    <span className="text-text-tertiary typo-footnote">{label}</span>
  </div>
);

const WidgetHeader = ({
  title,
  icon,
  trailing,
}: {
  title: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-2">
    <h2 className="flex items-center gap-1 font-bold text-text-primary typo-callout">
      {icon}
      {title}
    </h2>
    <div className="flex items-center gap-1">
      {trailing}
      <Control action="Snapshot" />
    </div>
  </div>
);

const WidgetsScreen = ({ device }: { device: DeviceName }) => (
  <Device name={device}>
    <div className="flex flex-col gap-8 p-4">
      <section className="flex flex-col">
        <WidgetHeader title="Reading Overview" />
        <span className="mt-1 text-text-link typo-footnote">Learn more</span>
        <div className="my-3 flex gap-2">
          <SummaryCard count="100" label="Longest streak 🏆" />
          <SummaryCard count="720" label="Total reading days" />
        </div>
        <h3 className="my-1 text-text-tertiary typo-subhead">
          Top tags by reading days
        </h3>
        <div className="my-3 grid max-w-full grid-cols-2 gap-2">
          {[
            ['#typescript', 82],
            ['#react', 64],
            ['#webdev', 41],
            ['#css', 28],
          ].map(([tag, pct]) => (
            <div
              key={tag}
              className="relative overflow-hidden rounded-10 bg-surface-float px-2 py-1"
            >
              <span
                className="absolute inset-y-0 left-0 bg-action-share-default"
                style={{ width: `${pct as number}%` }}
              />
              <span className="relative text-text-primary typo-footnote">
                {tag}
              </span>
            </div>
          ))}
        </div>
        <h3 className="mb-3 text-text-tertiary typo-subhead">
          Posts read in the last months (3.4K)
        </h3>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 60 }, (_, i) => {
            const level = Math.max(
              0,
              Math.min(3, Math.round(2 + Math.sin(i / 4) * 1.4)),
            );
            const tone = [
              'bg-surface-float',
              'bg-overlay-float-cabbage',
              'bg-accent-cabbage-subtler',
              'bg-accent-cabbage-default',
            ][level];

            return (
              // eslint-disable-next-line react/no-array-index-key
              <span key={i} className={`size-3 rounded-4 ${tone}`} />
            );
          })}
        </div>
      </section>

      <section className="flex flex-col">
        <WidgetHeader title="Badges & Awards" />
        <span className="mt-1 text-text-link typo-footnote">Learn more</span>
        <div className="my-3 flex gap-3">
          <SummaryCard count="x3" label="Top reader badge" />
          <SummaryCard count="x14" label="Total Awards" />
        </div>
        <div className="flex flex-col gap-2">
          {['#typescript', '#react'].map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-2 rounded-10 bg-surface-float px-3 py-2 text-text-primary typo-footnote"
            >
              🥇 Top reader in {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <WidgetHeader
          icon={<MedalBadgeIcon className="size-4" />}
          title="Achievements"
          trailing={<span className="text-text-link typo-footnote">12/40</span>}
        />
        <div className="flex flex-col gap-2">
          {['Can&apos;t spend it all', 'Big byte energy'].map((name) => (
            <div
              key={name}
              className="flex items-start gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
            >
              <span className="size-12 shrink-0 rounded-12 bg-surface-invert" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-bold text-text-primary typo-callout">
                  {name}
                </span>
                <span className="text-text-tertiary typo-footnote">
                  Unlocked 12 Aug 2026
                </span>
              </div>
              <span className="font-bold text-text-primary typo-callout">
                120
              </span>
            </div>
          ))}
        </div>
      </section>
      {device === 'Mobile' && <span className="sr-only">mobile</span>}
    </div>
  </Device>
);

/* ---------------------------------------------------------------- devcard */

const DevCardScreen = () => (
  <Device name="Desktop">
    <div className="flex flex-col items-center gap-4 p-6">
      <span className="font-bold text-text-primary typo-title3">
        Your DevCard is ready
      </span>
      <div className="h-48 w-32 rounded-12 bg-surface-float" />
      <div className="flex items-center gap-2">
        <Button
          icon={<DownloadIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
        >
          Download
        </Button>
        <Control action="Share to" label variant={ButtonVariant.Primary} />
      </div>
    </div>
  </Device>
);

/* -------------------------------------------------------------------- page */

const Profile = () => (
  <SurfacePage
    intro="Three shareable things wearing one page: the identity at the top, the widgets that prove it, and the DevCard that packages it. They do not want the same control, and two of the three already have one."
    map="Sharing map: Copy link leads on the header (#6354, merged), Snapshot on the widgets (#6360), and Share to on the DevCard (#6356) — it is already an image, so wrapping it in another one adds nothing."
    title="Profile"
  >
    <Category
      covers="ProfileHeader.tsx · ProfileActions.tsx"
      title="The header"
      verdict="An h-36 cover with a 7.5rem rounded-16 avatar pinned over its bottom-left, then a right-aligned action row above the name — not beside it. Snapshot already ships in that row, and the copy link joins it there."
    >
      <Variant
        headline="Copy link beside snapshot"
        note="Recommended. The point of sharing a profile is that someone follows it, and an image cannot be followed — so the link belongs in the top row too, matched to the two buttons already there at Medium Float."
        step="Shipping"
      >
        <Rail>
          <ProfileScreen device="Desktop" />
          <ProfileScreen device="Mobile" />
        </Rail>
      </Variant>
    </Category>

    <Category
      covers="ReadingOverview.tsx · BadgesAndAwards.tsx · AchievementsWidget.tsx"
      title="The widgets"
      verdict="All three already carry a snapshot button, icon-only, in the header row beside the H2. Reading Overview has two summary cards, a tag-progress grid and the heatmap; Badges has two cards and a badge list; Achievements pairs its count link with the snapshot."
    >
      <Variant
        headline="Snapshot per widget"
        note="Shipped. Icon-only at the default Small, right-aligned in the header — and on Achievements it sits after the 12/40 link rather than replacing it."
        step="Shipping"
      >
        <Rail>
          <WidgetsScreen device="Desktop" />
          <WidgetsScreen device="Mobile" />
        </Rail>
      </Variant>
    </Category>

    <Category
      covers="#6356 · DevCard"
      title="The DevCard"
      verdict="Share to leads. The card is already an image; the job is getting it posted rather than saved."
    >
      <Variant
        headline="Share filled, download demoted"
        note="Flips the default from private save to public post. Cheap to test, trivial to revert."
        step="Shipping"
      >
        <Rail>
          <DevCardScreen />
        </Rail>
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof Profile> = {
  title: 'Features/Snapshot/Surfaces/Profile',
  component: Profile,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof Profile> = {};
