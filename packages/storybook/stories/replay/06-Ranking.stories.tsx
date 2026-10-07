import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  Callout,
  CalloutTone,
  CategoryChip,
  Mono,
  Page,
  PageHeader,
  Section,
  Table,
} from './shell';
import { Category } from './catalog';
import { FrameStyles, FrameThumb } from './frames';
import type { Person } from './people';
import type { Profile } from './data';
import { profiles, sampleData } from './data';
import type { Selection } from './ranking';
import { Eligibility, FAMILY_CAP, MIN_STAPLES, select, storyFrames } from './ranking';

const meta: Meta = {
  title: 'Replay/06. Ranking',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The selector, run over four real-shaped people. Same engine, four different recaps.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const Filmstrip = ({
  selection,
  person,
}: {
  selection: Selection;
  person: Person;
}): React.ReactElement => (
  <div className="flex gap-3 overflow-x-auto pb-2">
    {storyFrames(selection).map(
      (candidate, index) => (
        <div key={candidate.id} className="flex shrink-0 flex-col gap-2">
          <FrameThumb
            width={132}
            candidate={candidate}
            data={sampleData[candidate.id]}
            person={person}
          />
          <span className="w-[8.25rem] break-all font-mono text-text-quaternary typo-caption2">
            {index + 1}. {candidate.id}
          </span>
        </div>
      ),
    )}
  </div>
);

const Spread = ({
  selection,
}: {
  selection: Selection;
}): React.ReactElement => (
  <div className="flex flex-wrap gap-2">
    {Object.values(Category).map((category) => (
      <span
        key={category}
        className="flex items-center gap-1.5 rounded-10 border border-border-subtlest-tertiary px-2 py-1"
      >
        <CategoryChip category={category} />
        <span className="font-mono text-text-primary typo-caption1">
          {selection.categorySpread[category]}
        </span>
      </span>
    ))}
  </div>
);

const Breakdown = ({
  selection,
}: {
  selection: Selection;
}): React.ReactElement => (
  <Table
    head={['Candidate', 'Tier', 'Magnitude', 'Novelty', 'Score', 'Outcome']}
    minWidth={54}
    rows={[
      ...selection.frames.map((frame) => [
        <Mono>{frame.candidate.id}</Mono>,
        frame.candidate.tier,
        frame.magnitude.toFixed(2),
        frame.novelty.toFixed(2),
        <span className="font-bold text-text-primary">
          {frame.score.toFixed(2)}
        </span>,
        selection.hero === frame.candidate.id ? (
          <span className="text-accent-cheese-default">Hero · Tier S, card one</span>
        ) : selection.stapledWith.includes(frame.candidate.id) ? (
          <span className="text-accent-blueCheese-default">Staple slot</span>
        ) : (
          <span className="text-accent-avocado-default">Won a seat</span>
        ),
      ]),
      ...selection.rejected.slice(0, 6).map((frame) => [
        <span className="text-text-quaternary">
          <Mono>{frame.candidate.id}</Mono>
        </span>,
        <span className="text-text-quaternary">{frame.candidate.tier}</span>,
        <span className="text-text-quaternary">
          {frame.magnitude.toFixed(2)}
        </span>,
        <span className="text-text-quaternary">{frame.novelty.toFixed(2)}</span>,
        <span className="text-text-quaternary">{frame.score.toFixed(2)}</span>,
        <span className="text-text-quaternary">Cut</span>,
      ]),
    ]}
  />
);

const Person = ({ profile }: { profile: Profile }): React.ReactElement => {
  const selection = select({
    mode: profile.mode,
    signals: profile.signals,
    lastShown: profile.lastShown,
    opens: profile.opens,
    impressions: profile.impressions,
  });

  if (selection.eligibility === Eligibility.None) {
    return (
      <Section
        title={`${profile.name} · no Replay`}
        description={profile.summary}
      >
        <Callout tone={CalloutTone.Bad} title="Nothing renders">
          <p>
            Zero opens and zero impressions. The eligibility ladder returns
            nothing, the feed card does not appear, and that is the correct
            outcome: an empty recap is worse than none.
          </p>
        </Callout>
      </Section>
    );
  }

  return (
    <Section
      title={`${profile.name} · ${selection.frames.length} cards + handoff · ${selection.eligibility}`}
      description={profile.summary}
    >
      <Spread selection={selection} />
      <Filmstrip
        selection={selection}
        person={{
          login: profile.login,
          name: profile.name,
          handle: profile.handle,
        }}
      />
      <Breakdown selection={selection} />
    </Section>
  );
};

export const Ranking: Story = {
  render: () => (
    <Page>
      <FrameStyles />
      <PageHeader
        eyebrow="Replay"
        title="Same engine, four very different weeks"
      >
        <p>
          Everything below is computed by <Mono>select()</Mono> at render time.
          Change a magnitude in <Mono>data.ts</Mono> and these recaps change with
          it, which is the point: the ranking is a thing you can argue with, not
          a mock-up of one.
        </p>
        <p>
          The deck scales with what the person did. Five or more opens gets the
          full deck of up to five; one to four gets three; no opens gets nothing,
          however much scrolled past. Family
          cap is {FAMILY_CAP}, at least {MIN_STAPLES} staple slots, and card one
          is always a Tier S payload card. There is no opener.
        </p>
      </PageHeader>

      {profiles.map((profile) => (
        <Person key={profile.id} profile={profile} />
      ))}

      <Section title="What the three rules are actually for">
        <div className="grid gap-4 tablet:grid-cols-3">
          <Callout tone={CalloutTone.Good} title="Card one is the hero">
            <p>
              The Log lost a third of its audience on the welcome card and then
              held 83% of everyone else to the end. So there is no welcome, and
              the strongest Tier S card sits first, where people will see it,
              rather than last, where 44% never arrived.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Good} title="Novelty decay">
            <p>
              A highlight shown last week scores at 0.15 of its value. This is
              the load-bearing term: without it, week four is week one with
              different numbers, and that is how a weekly recap dies. Not from
              being disliked. From becoming predictable.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Good} title="The eligibility ladder">
            <p>
              Priya scrolled and opened nothing, so she gets nothing, and so
              does Noah, who never came. This reverses the
              earlier &quot;always render&quot; rule, and the Log data is why:
              the addressable audience is the 47% who open a post, not everyone.
            </p>
          </Callout>
        </div>
      </Section>

      <Section
        title="Hero early, not last"
        description="This contradicts the peak-end ordering the earlier spec used, and the Log data is why. Attrition after card one measured only 2 to 4 points per card, so moving the strongest card from position five to position two costs about ten points of reach but gains the 44% who never finished. With a share button on every card, the peak sits early and the deck ends on the handoff."
      >
        <Callout tone={CalloutTone.Bad} title="The failure mode to watch">
          Variety, not length. With a family cap of one and five slots, a
          cohort needs at least six live variants per staple family or week four
          is week one with new numbers. Track variant exhaustion by week four.
        </Callout>
      </Section>
    </Page>
  ),
};
