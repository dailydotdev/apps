import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Today, 100% production, next to the redesign, screen by screen, as
// screenshots: dark mode, 1440×900. Live frames took a minute to fill a page.
// After changing a screen, shoot it again. Each redesign image links to its
// live story; production's are only screenshots.

const screenshots = import.meta.glob<string>('../assets/compare/*.jpg', {
  eager: true,
  import: 'default',
});

const screenshotOf = (id: string): string | undefined =>
  screenshots[`../assets/compare/${id.replace('cores-boost-', '')}.jpg`];

type Pair = {
  name: string;
  /** Production screenshot id */
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

const Column = ({
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

const ComparePage = ({ pairs }: { pairs: Pair[] }): ReactElement => (
  <div className="flex min-h-screen flex-col gap-10 bg-background-default p-6">
    {pairs.map((pair) => (
      <section key={pair.name} className="flex flex-col gap-3">
        <h2 className="font-bold typo-title3">{pair.name}</h2>
        <div className="flex flex-col gap-4 laptop:flex-row">
          <Column label="Today · production" id={pair.today} isLink={false} />
          <Column
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

export const BoostAndAnalytics: Story = {
  name: '2. Boost and analytics',
  render: () => (
    <ComparePage
      pairs={pairsFor('2-boost-and-analytics', [
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
