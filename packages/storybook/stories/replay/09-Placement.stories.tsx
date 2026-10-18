import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  Callout,
  CalloutTone,
  Cell,
  Mono,
  Page,
  PageHeader,
  Section,
  Table,
} from './shell';
import { byId } from './catalog';
import { sampleData } from './data';
import { FrameStyles, FrameThumb } from './frames';
import { FeedCard } from './FeedCard';
import { DeliveryState } from './ranking';
import {
  defaultBubbles,
  HeaderBar,
  MockFeed,
  RecapStrip,
  StoryTray,
} from './FeedMocks';

const meta: Meta = {
  title: 'Replay/09. Placement',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Seven ways the recap can enter the feed, each shown in a feed rather than described.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const HERO = byId('persona.week');

const Option = ({
  n,
  title,
  what,
  children,
  pros,
  cons,
}: {
  n: string;
  title: string;
  what: string;
  children: React.ReactNode;
  pros: string[];
  cons: string[];
}): React.ReactElement => (
  <Section title={`${n} · ${title}`} description={what}>
    {children}
    <div className="grid gap-4 tablet:grid-cols-2">
      <Callout tone={CalloutTone.Good} title="Works because">
        <ul className="flex list-disc flex-col gap-1 pl-4">
          {pros.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Callout>
      <Callout tone={CalloutTone.Bad} title="Costs you">
        <ul className="flex list-disc flex-col gap-1 pl-4">
          {cons.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Callout>
    </div>
  </Section>
);

export const Placement: Story = {
  render: () => (
    <Page>
      <FrameStyles />
      <PageHeader
        eyebrow="Replay"
        title="Where the recap meets the feed"
      >
        <p>
          Nobody goes looking for a recap, so the entry point decides the whole
          feature. Open rate off this surface caps everything downstream:
          frames watched, frames shared, people who arrive from a share.
        </p>
        <p>
          Seven options below, each rendered in a feed rather than described.
          The trade is always the same one — how much attention it takes, against
          how much of the feed it costs.
        </p>
      </PageHeader>

      <Option
        n="01"
        title="Inline card"
        what="A feed item like any other, injected after the third post, the way FeedItemType.Highlight already enters the feed. Its face is frame one, so it is different every week."
        pros={[
          'Zero new surface area. It is a feed item, and the feed already knows how to render feed items.',
          'Scrolls away naturally. No dismissal argument, no interruption.',
          'The face carries a real fact, so it advertises itself rather than the feature.',
        ]}
        cons={[
          'Occupies a slot a post would have had. That is the guardrail metric.',
          'Entirely missable. Someone who opens two posts from the top never sees it.',
          'On mobile at one column it is a full screen of non-post content.',
        ]}
      >
        <MockFeed
          at={3}
          injected={
            <FeedCard
              candidate={HERO}
              data={sampleData[HERO.id]}
              state={DeliveryState.Available}
              frameCount={8}
            />
          }
        />
      </Option>

      <Option
        n="02"
        title="Story tray, one ring"
        what="A single ring pinned above the feed, the Instagram and Apple Health shape. Costs one row of height and no feed slot at all."
        pros={[
          'Universally understood. Nobody needs telling that a gradient ring means new and unwatched.',
          'Costs no feed slot, so the guardrail metric barely moves.',
          'The ring going grey once watched is a complete, familiar state model.',
        ]}
        cons={[
          'One ring with no context is a mystery box. It sells curiosity, not value.',
          'Pinned rows above a feed get banner-blind fast, which is exactly the week-four risk.',
          'A tray with one thing in it looks unfinished, and invites filling it with things that do not belong.',
        ]}
      >
        <MockFeed
          above={<StoryTray bubbles={defaultBubbles.slice(0, 1)} />}
          count={6}
        />
      </Option>

      <Option
        n="03"
        title="Story tray, one ring per highlight"
        what="The full Instagram model: every frame gets its own ring, watched ones go grey. Tapping one opens the story at that frame."
        pros={[
          'The tray previews the actual content, so people can see there is a Top reader badge in there before committing.',
          'Partial watching is native. Come back on Thursday and finish the two you skipped.',
          'It solves the tray-with-one-thing-in-it problem, and it makes the recap feel bigger than it is.',
        ]}
        cons={[
          'Lets people cherry-pick, which breaks the built order — the hook first, the strongest last.',
          'Five rings of your own stats above the feed every Monday is a lot of self-regard.',
          'Real estate creep: whoever wants a tray next will point at this one.',
        ]}
      >
        <MockFeed above={<StoryTray bubbles={defaultBubbles} />} count={6} />
      </Option>

      <Option
        n="04"
        title="Hero card"
        what="Full feed width above the first post. Frame one at size, with the highlight count and a single action."
        pros={[
          'Unmissable, which on a once-a-week surface is defensible.',
          'Room for the standing line, which is the part that actually makes people open it.',
          'Reads as an event rather than a feed item, matching what the recap is.',
        ]}
        cons={[
          'Pushes the first post below the fold. That is a real cost to the core product.',
          'The bigger it is, the worse a thin week looks in it.',
          'Hardest of all the options to dismiss gracefully.',
        ]}
      >
        <MockFeed
          above={
            <div className="flex w-full items-center gap-5 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5">
              <FrameThumb
                width={132}
                candidate={HERO}
                data={sampleData[HERO.id]}
              />
              <span className="flex flex-1 flex-col gap-2">
                <span className="uppercase tracking-[0.14em] text-text-quaternary typo-caption2">
                  Replay · Week 37
                </span>
                <span className="font-bold text-text-primary typo-title3">
                  You were a Night Owl Infra Digger
                </span>
                <span className="text-text-tertiary typo-callout">
                  Eight moments, including top 2% of Kubernetes readers and a Top
                  reader badge.
                </span>
                <span className="mt-1 flex items-center gap-2">
                  <span className="rounded-10 bg-text-primary px-3 py-1.5 font-bold text-surface-invert typo-footnote">
                    Open your week
                  </span>
                  <span className="px-2 py-1.5 text-text-quaternary typo-footnote">
                    Not now
                  </span>
                </span>
              </span>
            </div>
          }
          count={6}
        />
      </Option>

      <Option
        n="05"
        title="Slim strip"
        what="One line above the feed. An icon, what it is, what is in it, one button."
        pros={[
          'Cheapest possible interruption. Roughly 56px and no feed slot.',
          'Carries a reason to open, unlike the bare ring: it can name the Top reader badge.',
          'Trivially dismissible, and comfortable at any breakpoint.',
        ]}
        cons={[
          'Reads as a system notification, which is the least exciting thing the recap could be.',
          'No room for the artwork, so none of the frame design does any work here.',
          'Competes with every other strip we might want above the feed.',
        ]}
      >
        <MockFeed above={<RecapStrip />} count={6} />
      </Option>

      <Option
        n="06"
        title="Header icon only"
        what="No feed real estate whatsoever. A sparkle in the header with an unread dot, and the same entry in the mobile nav."
        pros={[
          'Zero cost to the feed. Nothing to defend at review.',
          'Permanent home: the recap becomes a place, not an interruption, which is what it needs to be by week ten anyway.',
          'The dot is enough signal for people who already know what it is.',
        ]}
        cons={[
          'Open rate will be a fraction of any in-feed option. Nobody hunts for a recap they have never seen.',
          'Discovery problem on week one is severe, and there is no good way to explain a dot.',
          'The header is already contested.',
        ]}
      >
        <MockFeed above={<HeaderBar />} count={6} />
      </Option>

      <Option
        n="07"
        title="Takeover on the first session"
        what="Full-screen, once per week, straight into the story. No card, no decision to make."
        pros={[
          'The highest completion rate available, by a wide margin.',
          'Matches how Wrapped is actually consumed, which is start to finish in one sitting.',
          'The share buttons get seen by everyone rather than by the people who chose to open it.',
        ]}
        cons={[
          'Interrupts a session someone started for another reason. Once a week is still fifty-two times a year.',
          'A thin week in a takeover is actively annoying rather than merely skippable.',
          'The blast radius of getting the content wrong is the whole user base.',
        ]}
      >
        <div className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary">
          <MockFeed count={6} />
          <div className="absolute inset-0 flex items-center justify-center bg-overlay-primary-pepper">
            <FrameThumb
              width={190}
              candidate={HERO}
              data={sampleData[HERO.id]}
            />
          </div>
        </div>
      </Option>

      <Section
        title="Side by side"
        description="Feed cost is the guardrail; open rate is the lever. Nothing here scores well on both."
      >
        <Table
          head={['Option', 'Feed cost', 'Expected open rate', 'Interruption', 'Room for the artwork']}
          minWidth={64}
          rows={[
            ['01 Inline card', 'One post slot', 'Medium', 'None', 'Good'],
            ['02 Story tray, one ring', 'One row', 'Low to medium', 'None', 'None'],
            ['03 Story tray, per highlight', 'One row', 'Medium to high', 'None', 'Preview only'],
            ['04 Hero card', 'Above the fold', 'High', 'Mild', 'Best'],
            ['05 Slim strip', 'One row', 'Low', 'None', 'None'],
            ['06 Header icon', 'None', 'Very low', 'None', 'None'],
            ['07 Takeover', 'None, but blocks', 'Highest', 'Real', 'Full'],
          ]}
        />
      </Section>

      <Section title="What I would ship">
        <div className="grid gap-4 tablet:grid-cols-3">
          <Cell label="Week one to four" note="Earn the habit">
            <Callout tone={CalloutTone.Good} title="Hero card, plus the header icon">
              <p>
                The recap has no reputation yet, so it has to be seen. The hero
                card buys that once a week, and the header icon starts teaching
                people where it lives.
              </p>
            </Callout>
          </Cell>
          <Cell label="After that" note="Settle into the feed">
            <Callout title="Inline card, plus the header icon">
              <p>
                Once people expect it on Monday, the hero card is spending
                above-the-fold real estate on something they were going to open
                anyway. Drop to the inline card and keep the permanent home.
              </p>
            </Callout>
          </Cell>
          <Cell label="Never" note="Two positions I would argue against">
            <Callout tone={CalloutTone.Bad} title="Takeover, and the bare ring">
              <p>
                A takeover risks the whole user base on content quality we have
                not proven. A single unlabelled ring is a mystery box, and
                mystery boxes stop working in about three weeks.
              </p>
            </Callout>
          </Cell>
        </div>
        <Callout title="The one to actually test">
          <p>
            Option 03, the per-highlight tray, is the most interesting and the
            least predictable. It previews the good stuff, it makes partial
            watching native, and it is the only option where someone can see a
            Top reader badge waiting for them without opening anything.
          </p>
          <p>
            The reason it is not my default is that it breaks the frame order,
            and the order is doing real work: hook first, strongest last. Worth
            an experiment against the inline card once <Mono>weekly_recap</Mono>{' '}
            is ramped.
          </p>
        </Callout>
      </Section>
    </Page>
  ),
};
