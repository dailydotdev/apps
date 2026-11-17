import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Frame } from '../../startups-onboarding/frame';

// Today, 100% production, next to the redesign, screen by screen, dark mode,
// 1440×900. "Wallet and buy Cores" shows the live stories, scaled into their
// column; frames load one at a time as they near the screen and "Open full
// size" opens one alone. "Boost and analytics" shows screenshots: after
// changing a screen, shoot it again. Each redesign image links to its live
// story; production's are only screenshots.

const today = (story: string): string =>
  `cores-boost-today-production--${story}`;

/** Two live stories side by side */
type LivePair = {
  name: string;
  /** Id of the production story */
  today: string;
  /** Id of the redesign story */
  redesign: string;
};

const flow = (story: string): string =>
  `cores-boost-redesign-1-wallet-and-buy-cores--${story}`;
const state = (story: string): string =>
  `cores-boost-redesign-3-states--${story}`;

const LiveColumn = ({
  label,
  id,
}: {
  label: string;
  id: string;
}): ReactElement => (
  <div className="flex min-w-0 flex-1 flex-col gap-2">
    <span className="font-bold text-text-tertiary typo-caption1">{label}</span>
    <Frame storyId={id} title={`${label}: ${id}`} width={1440} height={900} />
    <a
      href={`/?path=/story/${id}`}
      target="_top"
      className="text-text-link typo-caption1"
    >
      Open full size
    </a>
  </div>
);

const LiveComparePage = ({ pairs }: { pairs: LivePair[] }): ReactElement => (
  <div className="flex min-h-screen flex-col gap-10 bg-background-default p-6">
    {pairs.map((pair) => (
      <section key={pair.name} className="flex flex-col gap-3">
        <h2 className="font-bold typo-title3">{pair.name}</h2>
        <div className="flex flex-col gap-4 laptop:flex-row">
          <LiveColumn label="Today · production" id={pair.today} />
          <LiveColumn label="Redesign" id={pair.redesign} />
        </div>
      </section>
    ))}
  </div>
);

const screenshots = import.meta.glob<string>('../assets/compare/*.jpg', {
  eager: true,
  import: 'default',
});

const screenshotOf = (id: string): string | undefined =>
  screenshots[`../assets/compare/${id.replace('cores-boost-', '')}.jpg`];

/** Two screenshots side by side */
type ShotPair = {
  name: string;
  /** Production screenshot id */
  today: string;
  /** Unset where the redesign keeps the production screen */
  redesign?: string;
};

const shotPairsFor = (
  flowId: string,
  rows: [name: string, today: string, redesign: string | null][],
): ShotPair[] =>
  rows.map(([name, todayId, next]) => ({
    name,
    today: today(todayId),
    redesign: next ? `cores-boost-redesign-${flowId}--${next}` : undefined,
  }));

const shotClassName =
  'block overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-subtle';

/** A screenshot; a redesign one links to its live story */
const StoryShot = ({
  id,
  isLink,
}: {
  id: string;
  isLink: boolean;
}): ReactElement => {
  const image = (
    <img
      src={screenshotOf(id)}
      alt={id}
      loading="lazy"
      className="aspect-[16/10] w-full object-cover object-top"
    />
  );

  return isLink ? (
    <a href={`?path=/story/${id}`} target="_top" className={shotClassName}>
      {image}
    </a>
  ) : (
    <div className={shotClassName}>{image}</div>
  );
};

const ShotColumn = ({
  label,
  id,
  isLink,
}: {
  label: string;
  id: string;
  isLink: boolean;
}): ReactElement => (
  <div className="flex min-w-0 flex-1 flex-col gap-2">
    <span className="font-bold text-text-tertiary typo-caption1">{label}</span>
    <StoryShot id={id} isLink={isLink} />
  </div>
);

const ShotComparePage = ({ pairs }: { pairs: ShotPair[] }): ReactElement => (
  <div className="flex min-h-screen flex-col gap-10 bg-background-default p-6">
    {pairs.map((pair) => (
      <section key={pair.name} className="flex flex-col gap-3">
        <h2 className="font-bold typo-title3">{pair.name}</h2>
        <div className="flex flex-col gap-4 laptop:flex-row">
          <ShotColumn
            label="Today · production"
            id={pair.today}
            isLink={false}
          />
          <ShotColumn
            label={pair.redesign ? 'Redesign' : 'Redesign · unchanged'}
            id={pair.redesign ?? pair.today}
            isLink={!!pair.redesign}
          />
        </div>
      </section>
    ))}
  </div>
);

const meta: Meta = {
  title: 'Cores & Boost/Redesign/0. Today vs redesign',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const WalletAndBuyCores: Story = {
  name: '1. Wallet and buy Cores',
  render: () => (
    <LiveComparePage
      pairs={[
        {
          name: '1 · Your first Cores',
          today: today('first-cores-after-claim'),
          redesign: flow('your-first-cores'),
        },
        {
          name: '2 · Wallet',
          today: today('wallet'),
          redesign: flow('wallet-screen'),
        },
        {
          // Production's wallet sends Buy Cores to /cores
          name: '3 · Wallet · Buy Cores',
          today: today('cores'),
          redesign: flow('buy-cores-popup'),
        },
        {
          name: '4 · /cores',
          today: today('cores'),
          redesign: flow('cores'),
        },
        {
          name: 'You got your Cores!',
          today: today('cores-purchased'),
          redesign: state('purchased'),
        },
      ]}
    />
  ),
};

export const BoostAndAnalytics: Story = {
  name: '2. Boost and analytics',
  render: () => (
    <ShotComparePage
      pairs={shotPairsFor('2-boost-and-analytics', [
        ['1 · Own post', 'boost-own-post', 'own-post-new'],
        [
          '1 · Own post · taking off',
          'boost-own-post-older',
          'own-post-taking-off',
        ],
        ['2 · Boost your post', 'boost-form', 'boost-form'],
        [
          '2 · Boost your post · reading the post',
          'boost-form-new-post',
          'boost-form-reading',
        ],
        ['Processing', 'boost-processing-timed-out', null],
        ['3 · Back to the form', 'boost-back-to-form', 'boost-back-to-form'],
        ['4 · Boost is live!', 'boost-is-live', 'boost-is-live'],
        [
          '5 · Analytics, Boost tab (the Ads dashboard)',
          'ads-dashboard',
          'combined-boosted',
        ],
        [
          '5 · Campaign (now a row of the Boost tab)',
          'campaign-live',
          'combined-boosted',
        ],
        ['Boost notifications', 'boost-notifications', null],
        ['Boost again, prefilled', 'boost-again', 'boost-again'],
      ])}
    />
  ),
};
