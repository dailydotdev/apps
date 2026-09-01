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
  Category,
  Control,
  Device,
  OverflowMenu,
  Rail,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

type Spot = 'today' | 'snapshot' | 'lead';

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

const CopyMyFeed = () => (
  <SurfacePage
    intro="Your feed is the most personal thing in the product and it cannot leave in any form. There is no URL anyone else can open — your feed is yours — so an image is the only shareable shape it has."
    map="Sharing map: Snapshot leads (#6362). Copy link is not a secondary option here, it is absent — there is nothing to link to."
    title="Copy my feed"
  >
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

const meta: Meta<typeof CopyMyFeed> = {
  title: 'Features/Snapshot/Surfaces/Copy my feed',
  component: CopyMyFeed,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof CopyMyFeed> = {};
