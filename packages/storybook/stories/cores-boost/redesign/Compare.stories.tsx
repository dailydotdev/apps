import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Today, 100% production, next to the redesign, screen by screen, as
// screenshots: dark mode, 1440×900. Live frames took a minute to fill a page.
// After changing a screen, shoot it again; each redesign image links to its
// live story.

const screenshots = import.meta.glob<string>('../assets/compare/*.jpg', {
  eager: true,
  import: 'default',
});

const screenshotOf = (id: string): string | undefined =>
  screenshots[`../assets/compare/${id.replace('cores-boost-', '')}.jpg`];

type Pair = {
  name: string;
  /** Id of the production screenshot */
  today: string;
  /** Unset where the redesign keeps the production screen */
  redesign?: string;
};

const pairsFor = (
  flow: string,
  rows: [name: string, today: string, redesign: string | null][],
): Pair[] =>
  rows.map(([name, today, next]) => ({
    name,
    today: `cores-boost-today-production--${today}`,
    redesign: next ? `cores-boost-redesign-${flow}--${next}` : undefined,
  }));

const shotClassName =
  'block overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-subtle';

/** A story's screenshot; a redesign shot links to its live story */
const StoryShot = ({
  id,
  isLinked,
}: {
  id: string;
  isLinked: boolean;
}): ReactElement => {
  const image = (
    <img
      src={screenshotOf(id)}
      alt={id}
      loading="lazy"
      className="aspect-[16/10] w-full object-cover object-top"
    />
  );

  return isLinked ? (
    <a href={`?path=/story/${id}`} target="_top" className={shotClassName}>
      {image}
    </a>
  ) : (
    <span className={shotClassName}>{image}</span>
  );
};

const Column = ({
  label,
  id,
  isLinked = false,
}: {
  label: string;
  id: string;
  isLinked?: boolean;
}): ReactElement => (
  <div className="flex min-w-0 flex-1 flex-col gap-2">
    <span className="font-bold text-text-tertiary typo-caption1">{label}</span>
    <StoryShot id={id} isLinked={isLinked} />
  </div>
);

const ComparePage = ({ pairs }: { pairs: Pair[] }): ReactElement => (
  <div className="flex min-h-screen flex-col gap-10 bg-background-default p-6">
    {pairs.map((pair) => (
      <section key={pair.name} className="flex flex-col gap-3">
        <h2 className="font-bold typo-title3">{pair.name}</h2>
        <div className="flex flex-col gap-4 laptop:flex-row">
          <Column label="Today · production" id={pair.today} />
          <Column
            label={pair.redesign ? 'Redesign' : 'Redesign · unchanged'}
            id={pair.redesign ?? pair.today}
            isLinked={!!pair.redesign}
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
    <ComparePage
      pairs={pairsFor('1-wallet-and-buy-cores', [
        ['1 · Your first Cores', 'first-cores-after-claim', 'your-first-cores'],
        ['2 · Wallet', 'wallet', 'wallet-screen'],
        ['4 · /cores', 'cores', 'cores'],
        ['You got your Cores!', 'cores-purchased', null],
      ])}
    />
  ),
};
