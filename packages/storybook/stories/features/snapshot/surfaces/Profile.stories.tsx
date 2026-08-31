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
  MenuIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  AVATAR,
  Category,
  Control,
  OverflowMenu,
  Screen,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

type Spot = 'menu' | 'header' | 'lead';

const STATS = [
  ['1.2k', 'Reputation'],
  ['3,481', 'Posts read'],
  ['103', 'Level'],
];

const ProfileScreen = ({ spot }: { spot: Spot }) => (
  <Screen>
    <div className="h-20 bg-surface-float" />
    <div className="flex flex-col gap-4 p-4 pt-0">
      <div className="relative flex items-end gap-3">
        <img
          alt=""
          className="-mt-8 size-20 rounded-24 border-4 border-background-default object-cover"
          src={AVATAR}
        />
        <div className="flex min-w-0 flex-1 flex-col pb-1">
          <span className="truncate font-bold text-text-primary typo-title3">
            Tomer Redlich
          </span>
          <span className="truncate text-text-tertiary typo-footnote">
            @tomer
          </span>
        </div>
        <div className="flex items-center gap-2 pb-1">
          {spot === 'lead' ? (
            <>
              <Button
                aria-label="Edit profile"
                icon={<EditIcon />}
                size={ButtonSize.Medium}
                variant={ButtonVariant.Float}
              />
              <Control
                action="Snapshot"
                label
                size={ButtonSize.Medium}
                variant={ButtonVariant.Primary}
              />
            </>
          ) : (
            <>
              <Button
                aria-label="Edit profile"
                icon={<EditIcon />}
                size={ButtonSize.Medium}
                variant={ButtonVariant.Float}
              />
              {spot === 'header' && (
                <>
                  <Control
                    action="Link"
                    size={ButtonSize.Medium}
                    variant={ButtonVariant.Float}
                  />
                  <Control
                    action="Snapshot"
                    size={ButtonSize.Medium}
                    variant={ButtonVariant.Float}
                  />
                </>
              )}
              <Button
                aria-label="Options"
                icon={<MenuIcon />}
                size={ButtonSize.Medium}
                variant={ButtonVariant.Float}
              />
            </>
          )}
        </div>
        {spot === 'menu' && <OverflowMenu action="Link" />}
      </div>

      <div className="flex gap-6">
        {STATS.map(([value, label]) => (
          <div key={label} className="flex flex-col">
            <span className="font-bold text-text-primary typo-body">
              {value}
            </span>
            <span className="text-text-tertiary typo-caption1">{label}</span>
          </div>
        ))}
      </div>
    </div>
  </Screen>
);

const Widget = ({
  title,
  children,
  control,
}: {
  title: string;
  children: React.ReactNode;
  control?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3 border-t border-border-subtlest-tertiary p-4">
    <div className="flex items-center gap-2">
      <span className="flex-1 font-bold text-text-primary typo-footnote">
        {title}
      </span>
      {control}
    </div>
    {children}
  </div>
);

const Heatmap = () => (
  <div className="flex flex-wrap gap-1">
    {Array.from({ length: 56 }, (_, i) => {
      const level = Math.max(0, Math.min(3, Math.round(2 + Math.sin(i / 4) * 1.4)));
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
);

const WidgetsScreen = ({ withControls }: { withControls: boolean }) => (
  <Screen>
    <Widget
      control={withControls ? <Control action="Snapshot" /> : undefined}
      title="Reading overview"
    >
      <Heatmap />
      <div className="flex gap-6">
        {[
          ['720', 'Total reading days'],
          ['100', 'Longest streak'],
        ].map(([value, label]) => (
          <div key={label} className="flex flex-col">
            <span className="font-bold text-text-primary typo-footnote">
              {value}
            </span>
            <span className="text-text-quaternary typo-caption1">{label}</span>
          </div>
        ))}
      </div>
    </Widget>

    <Widget
      control={withControls ? <Control action="Snapshot" /> : undefined}
      title="Badges & awards"
    >
      <div className="flex gap-2">
        {['🥇', '🔥', '💎', '⚡'].map((glyph) => (
          <span
            key={glyph}
            className="flex size-9 items-center justify-center rounded-10 bg-surface-float"
          >
            {glyph}
          </span>
        ))}
      </div>
    </Widget>

    <Widget
      control={withControls ? <Control action="Snapshot" /> : undefined}
      title="Achievements · 12 of 40"
    >
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className="size-9 rounded-10 bg-surface-float" />
        ))}
      </div>
    </Widget>
  </Screen>
);

const DevCardScreen = ({ lead }: { lead: boolean }) => (
  <Screen>
    <div className="flex flex-col items-center gap-4 p-6">
      <span className="font-bold text-text-primary typo-title3">
        Your DevCard is ready
      </span>
      <div className="h-48 w-32 rounded-12 bg-surface-float" />
      <div className="flex items-center gap-2">
        <Button
          icon={<DownloadIcon />}
          size={ButtonSize.Small}
          variant={lead ? ButtonVariant.Float : ButtonVariant.Primary}
        >
          Download
        </Button>
        <Control
          action="Share to"
          label
          variant={lead ? ButtonVariant.Primary : ButtonVariant.Float}
        />
      </div>
    </div>
  </Screen>
);

const Profile = () => (
  <SurfacePage
    intro="The profile is three shareable things wearing one page: the identity at the top, the widgets that prove it, and the DevCard that packages it. They do not want the same control."
    map="Sharing map: lead with Copy link on the header (#6354, already merged), Snapshot on the widgets (#6360), and Share to on the DevCard (#6356) — it is already an image, so wrapping it in another one adds nothing."
    title="Profile"
  >
    <Category
      covers="#6354 · own and public profile headers"
      title="The header"
      verdict="Link leads: the point of sharing a profile is that someone follows it, and an image cannot be followed."
    >
      <Variant
        headline="Inside the ⋯ menu"
        note="The before. #6354 already promoted it out of here — this is what it looked like."
        step="Today"
      >
        <ProfileScreen spot="menu" />
      </Variant>
      <Variant
        headline="Icons in the header, matched to Edit"
        note="Recommended. Same Medium size and Float weight as the edit button beside them, so they read as peers rather than an afterthought."
        step="Recommended"
      >
        <ProfileScreen spot="header" />
      </Variant>
      <Variant
        headline="Snapshot labeled and leading"
        note="Test candidate. The profile snapshot carries the stats a link only promises — but it costs the follow, which is the whole point of a profile share."
        step="Push"
      >
        <ProfileScreen spot="lead" />
      </Variant>
    </Category>

    <Category
      covers="#6360 · reading overview, badges, achievements"
      title="The widgets"
      verdict="Snapshot leads. There is no URL that shows someone your heatmap — the widget is the payload."
    >
      <Variant
        headline="No control on any widget"
        note="Three of the most screenshot-worthy blocks in the product, and people currently screenshot them by hand."
        step="Today"
      >
        <WidgetsScreen withControls={false} />
      </Variant>
      <Variant
        headline="Snapshot per widget, Tertiary weight"
        note="Built and live. Tertiary rather than Secondary so it sits between the widget titles without outweighing them."
        step="Recommended"
      >
        <WidgetsScreen withControls />
      </Variant>
    </Category>

    <Category
      covers="#6356 · DevCard"
      title="The DevCard"
      verdict="Share to leads. The card is already an image; the job is getting it posted rather than saved."
    >
      <Variant
        headline="Download, and that is all"
        note="The card gets generated, saved to a downloads folder, and usually never posted."
        step="Today"
      >
        <DevCardScreen lead={false} />
      </Variant>
      <Variant
        headline="Share filled, download demoted"
        note="Flips the default from private save to public post. Cheap to test, trivial to revert."
        step="Recommended"
      >
        <DevCardScreen lead />
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
