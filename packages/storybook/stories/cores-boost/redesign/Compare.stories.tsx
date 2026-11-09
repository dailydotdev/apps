import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Today, 100% production (the "Today (production)" stories), next to the
// redesign, screen by screen, as screenshots of the real stories: dark mode,
// 1440×900. Live frames took a minute to fill a page. After changing a
// screen, shoot it again; each image links to its live story.

const screenshots = import.meta.glob<string>('../assets/compare/*.jpg', {
  eager: true,
  import: 'default',
});

const screenshotOf = (id: string): string | undefined =>
  screenshots[`../assets/compare/${id.replace('cores-boost-', '')}.jpg`];

type Pair = {
  name: string;
  /** "Today (production)" story id */
  today: string;
  redesign: string;
};

const pairsFor = (
  flow: string,
  rows: [name: string, today: string, redesign: string][],
): Pair[] =>
  rows.map(([name, today, next]) => ({
    name,
    today: `cores-boost-today-production--${today}`,
    redesign: `cores-boost-redesign-${flow}--${next}`,
  }));

/** A story's screenshot, linking to the live story */
const StoryShot = ({ id }: { id: string }): ReactElement => (
  <a
    href={`?path=/story/${id}`}
    target="_top"
    className="block overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-subtle"
  >
    <img
      src={screenshotOf(id)}
      alt={id}
      loading="lazy"
      className="aspect-[16/10] w-full object-cover object-top"
    />
  </a>
);

const Column = ({
  label,
  id,
}: {
  label: string;
  id: string;
}): ReactElement => (
  <div className="flex min-w-0 flex-1 flex-col gap-2">
    <span className="font-bold text-text-tertiary typo-caption1">{label}</span>
    <StoryShot id={id} />
  </div>
);

const ComparePage = ({ pairs }: { pairs: Pair[] }): ReactElement => (
  <div className="flex min-h-screen flex-col gap-10 bg-background-default p-6">
    {pairs.map((pair) => (
      <section key={pair.redesign} className="flex flex-col gap-3">
        <h2 className="font-bold typo-title3">{pair.name}</h2>
        <div className="flex flex-col gap-4 laptop:flex-row">
          <Column label="Today · production" id={pair.today} />
          <Column label="Redesign" id={pair.redesign} />
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

export const FirstCores: Story = {
  name: '1. First Cores',
  render: () => (
    <ComparePage
      pairs={pairsFor('1-first-cores', [
        ['1 · Quest reward', 'first-cores-quest-reward', 'quest-reward'],
        ['2 · Your first Cores', 'first-cores-after-claim', 'your-first-cores'],
        [
          '3 · Wallet with "Use your Cores"',
          'first-cores-wallet',
          'wallet-use-your-cores',
        ],
        ['4 · Nudge on own post', 'first-cores-own-post', 'nudge-on-own-post'],
      ])}
    />
  ),
};

export const GiveAward: Story = {
  name: '2. Give an award',
  render: () => (
    <ComparePage
      pairs={pairsFor('2-give-an-award', [
        ['2 · Pick an award', 'award-picked-too-expensive', 'pick-an-award'],
        ['3 · Buy Cores, pack preselected', 'award-buy-cores', 'buy-cores'],
        ['5 · Processing', 'award-processing-timed-out', 'processing'],
        ['6 · Note and send', 'award-note', 'note-and-send'],
        ['7 · Award sent', 'award-sent', 'award-sent'],
        ['8 · Back where you were · old iOS', 'award-old-ios', 'old-ios'],
      ])}
    />
  ),
};

export const ReceiveAward: Story = {
  name: '3. Receive an award',
  render: () => (
    <ComparePage
      pairs={pairsFor('3-receive-an-award', [
        [
          '2 · Award received, with context',
          'receive-notification',
          'award-received-with-context',
        ],
        ['3 · Balance refreshes', 'receive-notification', 'balance-refreshes'],
        [
          '4 · Wallet, row highlighted',
          'receive-wallet',
          'wallet-row-highlighted',
        ],
      ])}
    />
  ),
};

export const WalletAndBuying: Story = {
  name: '4. Wallet and buying',
  render: () => (
    <ComparePage
      pairs={pairsFor('4-wallet-and-buying', [
        ['1 · Ways in', 'wallet-ways-in', 'ways-in'],
        ['2 · Wallet', 'wallet', 'wallet-screen'],
        ['3 · /cores', 'cores', 'cores'],
        [
          '4 · You got your Cores!',
          'cores-purchased',
          'you-got-your-cores',
        ],
        ['5 · Back to the wallet', 'cores-got-it-home', 'back-to-the-wallet'],
      ])}
    />
  ),
};

export const FirstBoost: Story = {
  name: '5. First boost',
  render: () => (
    <ComparePage
      pairs={pairsFor('5-first-boost', [
        ['1 · Own post', 'boost-own-post', 'own-post-new'],
        [
          '1 · Own post · taking off',
          'boost-own-post-older',
          'own-post-taking-off',
        ],
        ['2 · Boost your post', 'boost-form', 'boost-form'],
        ['2 · Boost your post · custom', 'boost-form', 'boost-form-custom'],
        [
          '2 · Boost your post · reading the post',
          'boost-form-new-post',
          'boost-form-reading',
        ],
        ['3 · Buy Cores, pack preselected', 'boost-buy', 'buy-cores'],
        ['4 · Processing', 'boost-processing-timed-out', 'processing'],
        ['5 · Boost launches', 'boost-back-to-form', 'boost-launches'],
        ['6 · Boost is live!', 'boost-is-live', 'boost-is-live'],
      ])}
    />
  ),
};

export const AfterBoost: Story = {
  name: '6. After the boost',
  render: () => (
    <ComparePage
      pairs={pairsFor('6-after-the-boost', [
        ['1 · Boosts page', 'ads-dashboard', 'boosts-page-story'],
        [
          '1 · Boosts page, nothing live',
          'ads-dashboard-empty',
          'boosts-page-empty',
        ],
        ['2 · Campaign', 'campaign-live', 'campaign-live'],
        ['2 · Campaign, ended', 'campaign-ended', 'campaign-ended'],
        ['3 · Boost is live', 'boost-notifications', 'live-notification'],
        [
          '4 · Boost ended, with results',
          'boost-notifications',
          'ended-notification',
        ],
        ['5 · Boost again, prefilled', 'boost-again', 'boost-again'],
        ['6 · Boost is live!', 'boost-is-live', 'boost-is-live'],
      ])}
    />
  ),
};
