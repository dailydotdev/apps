import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { linkTo } from '@storybook/addon-links';
import { Mono, Page, PageHeader, Section } from './shell';
import type { Candidate } from './catalog';
import {
  annualFlagships,
  Audience,
  Category,
  categoryNote,
  catalog,
  byId,
  FrameLayout,
  handoffFrame,
  Moat,
  Status,
} from './catalog';
import { FrameStyles, FrameThumb } from './frames';
import { sampleData } from './data';

const meta: Meta = {
  title: 'Replay/00. Start here',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One card per type. Click through to see every example of the one you care about.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const ALL: Candidate[] = [
  ...catalog,
  ...annualFlagships,
  handoffFrame,
];

/** The card that best represents each category, for the front door. */
const HERO_OF: Record<Category, string> = {
  [Category.Crown]: 'crown.topReader',
  [Category.Surprise]: 'persona.week',
  [Category.Community]: 'community.podium',
  [Category.Stat]: 'reading.grid',
};

const CategoryRow = ({
  category,
  onOpen,
}: {
  category: Category;
  onOpen: () => void;
}): React.ReactElement => {
  const items = ALL.filter((item) => item.category === category);
  const hero = byId(HERO_OF[category]);
  const ours = items.filter((item) => item.moat === Moat.Ours).length;
  const shipping = items.filter(
    (item) => item.status === Status.Now,
  ).length;

  return (
    <div className="flex flex-wrap items-start gap-7 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6">
      <FrameThumb width={196} candidate={hero} data={sampleData[hero.id]} />
      <div className="flex min-w-[18rem] flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="uppercase tracking-[0.14em] text-text-quaternary typo-caption2">
            {items.length} cards
          </span>
          <h3 className="capitalize typo-title2">{category}</h3>
          <p className="max-w-[46ch] text-text-tertiary typo-callout">
            {categoryNote[category]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-8 bg-surface-hover px-2 py-1 text-text-tertiary typo-caption2">
            {shipping} ship now
          </span>
          <span className="rounded-8 bg-surface-hover px-2 py-1 text-text-tertiary typo-caption2">
            {ours} only we can say
          </span>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="w-fit rounded-10 bg-text-primary px-4 py-2 font-bold text-surface-invert typo-footnote"
        >
          See all {items.length} &rarr;
        </button>
      </div>
    </div>
  );
};

export const StartHere: Story = {
  name: 'Start here',
  render: () => {
    const oneEachLayout = Object.values(FrameLayout)
      .map((layout) => ALL.find((item) => item.layout === layout))
      .filter((item): item is Candidate => Boolean(item));

    return (
      <Page>
        <FrameStyles />
        <PageHeader eyebrow="Replay" title="Every kind of card, one of each">
          <p>
            There are {ALL.length} cards in the catalog, which is far too many to
            review as a wall. This page shows one of each kind. Pick the one you
            want to argue with and click through.
          </p>
        </PageHeader>

        <Section
          title="Four categories"
          description="What a card feels like. The selector fills a deck with one Tier S hero first, then at least two staples, then score, one card per family."
        >
          <div className="flex flex-col gap-5">
            {Object.values(Category).map((category) => (
              <CategoryRow
                key={category}
                category={category}
                onOpen={linkTo('Replay/12. Card gallery', 'By category')}
              />
            ))}
          </div>
        </Section>

        <Section
          title={`${oneEachLayout.length} card types`}
          description="What a card is shaped like. One layout carries many cards: a frame is a layout, a hue and data, because bespoke art per card does not survive a weekly cadence."
        >
          <div className="flex flex-wrap gap-6">
            {oneEachLayout.map((candidate) => (
              <button
                key={candidate.layout}
                type="button"
                onClick={linkTo('Replay/02. Frames', 'Every layout')}
                className="flex flex-col gap-2 text-left"
              >
                <FrameThumb
                  width={148}
                  candidate={candidate}
                  data={sampleData[candidate.id]}
                />
                <span className="w-[9.25rem] font-mono text-text-primary typo-caption1">
                  {candidate.layout}
                </span>
              </button>
            ))}
          </div>
        </Section>

        <Section
          title="Where everything else lives"
          description="Sixteen stories. These are the four worth opening first."
        >
          <div className="grid gap-4 tablet:grid-cols-2">
            {[
              {
                to: ['Replay/13. The deck', 'The deck'] as const,
                title: 'The deck',
                body: 'How someone actually consumes the cards. Drag one and it goes to the back. Six patterns compared, with the one I would ship.',
              },
              {
                to: ['Replay/11. Playground', 'Playground'] as const,
                title: 'The playground',
                body: 'Walk the whole journey. Pick who you are, where the entry point sits and which day they arrive, then click feed to share.',
              },
              {
                to: ['Replay/12. Card gallery', 'By shareability — the ladder'] as const,
                title: 'The shareability ladder',
                body: 'Every card ranked S to Cut on how likely it is to be posted, grounded in what users did with the annual Log. The view that decides what ships.',
              },
              {
                to: ['Replay/15. The two mechanisms', 'Self-insight and standing'] as const,
                title: 'The two mechanisms',
                body: 'Self-insight and standing against other developers: the research behind both, the rules, the archetype system and the standing engine.',
              },
            ].map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={linkTo(item.to[0], item.to[1])}
                className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5 text-left transition-colors hover:bg-surface-hover"
              >
                <span className="font-bold text-text-primary typo-callout">
                  {item.title} &rarr;
                </span>
                <span className="text-text-tertiary typo-footnote">
                  {item.body}
                </span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="The rest, in order">
          <div className="flex flex-col gap-px overflow-hidden rounded-16 border border-border-subtlest-tertiary">
            {[
              ['00. Start here', 'This page.'],
              ['00. Strategy', 'Why the recap is shaped the way it is. The three acts, the mechanics, the moat.'],
              ['01. Catalog', 'Every candidate mapped to the field it reads.'],
              ['02. Frames', 'Every card rendered, plus one of each layout and the full-size view.'],
              ['03. Story viewer', 'The tap-through player.'],
              ['04. Feed card', 'The entry point in every delivery state.'],
              ['05. Delivery and cadence', 'When it appears, and what happens after an absence.'],
              ['06. Ranking', 'The selector run over four people.'],
              ['07. Sharing', 'Crops, export, the reward, the metrics.'],
              ['08. Rollout', 'Phases, the flag, and what is still open.'],
              ['09. Placement', 'Seven feed entry points.'],
              ['10. The journey', 'End to end, every surface, every edge.'],
              ['11. Playground', 'The interactive simulator.'],
              ['12. Card gallery', 'Every card by moat, audience and category.'],
              ['13. The deck', 'The consumption pattern.'],
              ['14. Metric and comparison', 'One metric, one comparison, one cadence per card.'],
              ['15. The two mechanisms', 'Self-insight and standing: the research, the rules, the archetypes.'],
              ['Replay delivery / 00, 00b, 00c, 00d, 00e, 00f, 00g, 00h, 00i, 01 to 05', 'How the week reaches people: nine feed concepts, the pack taken into the product (Monday, the strip, foil, share unit, binder, pull to tear), twelve entry points that all open the pop-up deck, a second round of thirteen bolder doors (objects on the feed, your data as the handle, one-off moments), nine skies (the week as colour above the feed), the aurora reduced to eight small lacquer objects with abstract marks, where the seal lives in the real v2 rail, the classic header and the mobile top, the full-size object at the head of the feed across five widths in both layouts, the picks (pull to reveal saved for mobile; the band and the slot, rectangular marks with a bright sheen, for desktop), the conventional entry points, the notification, turning push on, the email, and the recommended stack.'],
            ].map(([name, note]) => (
              <div
                key={name}
                className="flex flex-wrap gap-x-4 gap-y-1 bg-surface-float px-5 py-3"
              >
                <Mono>{name}</Mono>
                <span className="flex-1 text-text-tertiary typo-footnote">
                  {note}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </Page>
    );
  },
};
