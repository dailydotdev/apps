import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { Callout, CalloutTone, Cell, Page, PageHeader, PhoneFrame, Section, Table } from '../shell';
import { PhoneShell, Post, ProductShell } from './product';
import { ReplayPopup } from './entry';
import {
  AuroraSky,
  ForecastSky,
  GrowingSky,
  HairlineSky,
  HeaderSkyChip,
  headerSkyStyle,
  HorizonSky,
  MastheadSky,
  NightSky,
  SkyStyles,
  SpectrumSky,
  TOPICS,
} from './sky';

const meta: Meta = {
  title: 'Replay delivery/00e. The sky, explored',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One idea, nine skies: the week as colour above the feed. Different encodings of the same data, different heights, and the version that builds all week and seals on Monday. All open the pop-up.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const Sky = ({
  number,
  title,
  idea,
  children,
  why,
  risk,
}: {
  number: number;
  title: string;
  idea: string;
  children: ReactNode;
  why: string;
  risk: string;
}): ReactElement => (
  <Section title={`${number} · ${title}`} description={idea}>
    {children}
    <div className="grid gap-4 tablet:grid-cols-2">
      <Callout tone={CalloutTone.Good} title="What it says about you">
        <p>{why}</p>
      </Callout>
      <Callout tone={CalloutTone.Bad} title="Where it breaks">
        <p>{risk}</p>
      </Callout>
    </div>
  </Section>
);

export const Skies: Story = {
  name: 'Nine skies',
  render: () => {
    const [open, setOpen] = useState(false);
    const go = () => setOpen(true);
    return (
      <>
        <ReplayPopup open={open} onClose={() => setOpen(false)} />
        <Page>
          <SkyStyles />
          <PageHeader eyebrow="Replay delivery · the sky" title="Your week has a colour before it has a claim">
            <p>
              The sky is the person&apos;s week as colour above the feed. Each
              topic keeps its colour from week to week, so the band becomes
              recognisable the way a language bar on GitHub is, and the share of
              the week a topic took is the share of the sky it gets. Nine
              versions of that idea: four ways to encode the week, three
              heights, one that lives in the header, and one that builds from
              Monday to Sunday and seals. Hover the first one.
            </p>
          </PageHeader>

          <Section title="The palette rule">
            <div className="flex flex-wrap items-center gap-5">
              {TOPICS.map((topic) => (
                <span key={topic.name} className="flex items-center gap-2 text-text-tertiary typo-footnote">
                  <span className="h-4 w-4 rounded-[999px]" style={{ background: topic.hue }} />
                  {topic.name}
                  <span className="text-text-quaternary" style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.round(topic.share * 100)}% · {topic.reads} reads</span>
                </span>
              ))}
            </div>
            <Callout tone={CalloutTone.Neutral} title="Why the colours are fixed per topic">
              <p>
                If Kubernetes is always this blue, a mostly blue sky means a
                Kubernetes week without a word. The mapping comes from the tag
                system and never changes for a person, so two weeks can be
                compared at a glance, and a friend&apos;s sky is legible too.
              </p>
            </Callout>
          </Section>

          <Sky
            number={1}
            title="The spectrum"
            idea="GitHub's language bar, for your week. One thin bar, segments sized by share, hover a segment and it widens and names itself. The most literal sky, and the one developers already know how to read."
            why="Sixty-three percent Kubernetes is a fact you can see. The bar is a data visualisation that reads as decoration until you look, which is the right order."
            risk="Thin bars are easy to scroll past. The label row under it is doing the work of making it a door; without it the bar is a divider."
          >
            <ProductShell count={6} above={<SpectrumSky onOpen={go} />} />
          </Sky>

          <Sky
            number={2}
            title="The aurora"
            idea="The landing page's blurred orbs, drifting, in the week's three biggest topic colours. The claim sits on it. Nothing is measured; it is weather."
            why="It borrows the brand's own atmosphere, so the feed's top edge looks like daily.dev's marketing site for one row. Ambient, slow, and no two weeks drift the same."
            risk="It is the least legible sky: you cannot read shares off a blur. Works as a mood above the spectrum, not instead of it."
          >
            <ProductShell count={6} above={<AuroraSky onOpen={go} />} />
          </Sky>

          <Sky
            number={3}
            title="The horizon"
            idea="Seven columns for seven days, each glowing in the day's dominant topic, brighter the more you read. A small sun rises where Monday is. The week as a skyline of light."
            why="It adds time to the palette: you can see that Tuesday was the bright one and Saturday was dark. A week with a shape is a week with a story."
            risk="Seven columns of gradient can look like a chart that lost its axes. The caption on the right has to say the one thing the shape means."
          >
            <ProductShell count={6} above={<HorizonSky onOpen={go} />} />
          </Sky>

          <Sky
            number={4}
            title="The night sky"
            idea="Every read is a star, placed by the day it happened and the hour. A night owl's week is a sky with its stars low and late. The moon is there because it is night."
            why="Generated from the reading grid, so it is unique per person and it carries the archetype without saying it: the stars are where the reads were, and for this person they are all after eleven."
            risk="Beautiful and slow to read. It rewards the second look, which most feed glances do not give; best on Monday when there is a reason to look."
          >
            <ProductShell count={6} above={<NightSky onOpen={go} />} />
          </Sky>

          <Sky
            number={5}
            title="The forecast"
            idea="A weather strip: seven days, a sun for the heavy days, cloud for the light ones, a dash for the empty ones, and the count under each. Today is highlighted."
            why="Everyone can read a weather strip in a glance, and it is honest about quiet days without making them a failure: a cloudy Saturday is just a cloudy Saturday."
            risk="Weather is a metaphor that can get cute. Icons must stay geometric and the copy must stay dry, or it turns into a greeting card."
          >
            <ProductShell count={6} above={<ForecastSky onOpen={go} />} />
          </Sky>

          <Sky
            number={6}
            title="The hairline"
            idea="Four pixels at the very top of the page, above the header, the spectrum at its thinnest. Hover and it opens to 28 pixels with the topic names. A tab at the right says the week is in."
            why="The quietest door on any of these pages. It costs literally nothing and it is always there; it turns the top edge of the app into a signal you learn to read."
            risk="Four pixels is below the threshold most people notice. It is what the sky should collapse to from Tuesday, not the Monday door."
          >
            <div className="flex flex-col gap-6">
              <ProductShell count={3} topEdge={<HairlineSky onOpen={go} />} />
              <ProductShell count={3} topEdge={<HairlineSky onOpen={go} expanded />} />
            </div>
          </Sky>

          <Sky
            number={7}
            title="The header takes the sky"
            idea="No new element at all. The header's own background is tinted with the week's palette, faintly, and a small chip on it carries a miniature of the spectrum and the door."
            why="It changes the room instead of adding furniture. The app looks like your week for a week, and the chip is the only thing you need to click."
            risk="Tinting the header touches the most stable piece of chrome in the product. The tint has to stay under ten percent or it fights the brand."
          >
            <ProductShell count={6} headerStyle={headerSkyStyle} headerRight={<HeaderSkyChip onOpen={go} />} />
          </Sky>

          <Sky
            number={8}
            title="The masthead sky"
            idea="Monday's tall version: the aurora at full height with the claim at poster size, the palette bar under it, and the hero card rising from the bottom edge. Collapses to the hairline on scroll."
            why="It is the one sky that makes Monday look like Monday before anything is read. The aurora, the claim and the card are one composition."
            risk="It is a takeover of the top of the feed. Once per week, first session, and only for people who did not open the week somewhere else first."
          >
            <ProductShell count={3} above={<MastheadSky onOpen={go} />} />
          </Sky>

          <Sky
            number={9}
            title="The sky that builds"
            idea="The sky is not delivered on Monday, it is drawn all week. Each day adds a column; Sunday night it says it seals tonight; Monday it is complete, lit, and it is the door."
            why="Anticipation made visible. You watch your own week take shape, and Monday's open is finding out how the drawing ended. Nobody else's product does this with a recap."
            risk="Needs the reading data daily rather than weekly, which the streak already has. A person who does not read for three days watches three grey columns, which is honest but not flattering."
          >
            <div className="flex flex-col gap-3">
              <GrowingSky onOpen={go} day={1} />
              <GrowingSky onOpen={go} day={3} />
              <GrowingSky onOpen={go} day={7} />
              <GrowingSky onOpen={go} day={8} />
            </div>
          </Sky>

          <Section title="On the phone">
            <div className="flex flex-wrap items-start gap-6">
              {[
                ['The hairline', <HairlineSky key="h" onOpen={go} />, true],
                ['The spectrum', <div key="s" className="px-3 pt-3"><SpectrumSky onOpen={go} labels="none" /></div>, false],
                ['The night sky', <div key="n" className="px-3 pt-3"><NightSky onOpen={go} /></div>, false],
              ].map(([label, node, top]) => (
                <div key={String(label)} className="flex flex-col gap-2">
                  <PhoneFrame>
                    <div className="h-[30rem] overflow-hidden rounded-[1.75rem]">
                      <PhoneShell header={!top}>
                        {top && (
                          <>
                            {node}
                            <div className="flex h-12 items-center gap-3 border-b border-border-subtlest-tertiary px-3 text-text-quaternary typo-caption1">Search</div>
                          </>
                        )}
                        {!top && node}
                        <div className="flex flex-col gap-3 p-3">
                          <Post index={0} />
                        </div>
                      </PhoneShell>
                    </div>
                  </PhoneFrame>
                  <span className="text-text-tertiary typo-footnote">{String(label)}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Side by side">
            <Table
              head={['Sky', 'Encodes', 'Height', 'Legible at a glance', 'Unique per person', 'Best day']}
              minWidth={68}
              rows={[
                ['1 · Spectrum', 'Topic share', 'One row', 'Yes', 'Yes', 'All week'],
                ['2 · Aurora', 'Top three topics, mood', 'Tall row', 'No', 'Somewhat', 'Monday'],
                ['3 · Horizon', 'Topic by day, intensity', 'Tall row', 'Mostly', 'Yes', 'Monday to Wednesday'],
                ['4 · Night sky', 'Every read by day and hour', 'Tall row', 'No, rewards a look', 'Entirely', 'Monday'],
                ['5 · Forecast', 'Reads per day', 'Tall row', 'Yes', 'Yes', 'All week'],
                ['6 · Hairline', 'Topic share', '4px', 'No, learned', 'Yes', 'Tuesday onward'],
                ['7 · Header tint', 'Topic share, faint', 'None', 'No', 'Yes', 'All week'],
                ['8 · Masthead', 'Mood plus the claim', 'Masthead', 'Yes', 'Somewhat', 'Monday, once'],
                ['9 · Builds', 'Days as they happen', 'One row', 'Yes', 'Yes', 'Every day'],
              ]}
            />
          </Section>

          <Section title="The sky I would ship">
            <div className="grid gap-4 tablet:grid-cols-3">
              <Cell label="Every day" note="9 · the sky that builds, as the spectrum">
                <p className="text-text-tertiary typo-footnote">The one-row spectrum above the feed, drawn a column at a time through the week. Sunday it says it seals tonight.</p>
              </Cell>
              <Cell label="Monday" note="8 · the masthead sky">
                <p className="text-text-tertiary typo-footnote">The sealed week arrives tall: aurora, the claim, the card rising. One scroll and it is the spectrum again, now lit and clickable.</p>
              </Cell>
              <Cell label="After Monday" note="6 · the hairline">
                <p className="text-text-tertiary typo-footnote">Once opened, the sky folds to four pixels at the top of the app. It stays the person's colours all week, and next Monday it starts drawing again.</p>
              </Cell>
            </div>
            <Callout tone={CalloutTone.Good} title="Why the sky over the others">
              <p>
                It is the only door that is made of the person&apos;s data and
                still costs the feed nothing. It says a Kubernetes week is blue
                without a label, it is different for everyone, and it can be
                there every day of the week without asking for anything until
                Monday.
              </p>
            </Callout>
          </Section>
        </Page>
      </>
    );
  },
};
