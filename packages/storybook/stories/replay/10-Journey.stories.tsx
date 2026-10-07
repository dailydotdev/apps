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

const meta: Meta = {
  title: 'Replay/10. The journey',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The whole experience end to end: the first one, the weekly loop, every surface, and the edges.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const Step = ({
  n,
  title,
  body,
  watch,
}: {
  n: string;
  title: string;
  body: string;
  watch: string;
}): React.ReactElement => (
  <li className="flex gap-4 bg-surface-float px-5 py-4">
    <span className="font-mono text-accent-cabbage-default typo-footnote">
      {n}
    </span>
    <span className="flex flex-1 flex-col gap-1">
      <span className="font-bold text-text-primary typo-callout">{title}</span>
      <span className="text-text-tertiary typo-footnote">{body}</span>
      <span className="text-text-quaternary typo-caption1">
        Where it breaks: {watch}
      </span>
    </span>
  </li>
);

export const Journey: Story = {
  render: () => (
    <Page>
      <FrameStyles />
      <PageHeader eyebrow="Replay" title="The whole experience, end to end">
        <p>
          The frames are the product and the ranking is the engine, but the
          experience is what decides whether either of them gets seen a second
          time. This is the map: the first recap someone ever gets, the loop it
          settles into, every surface it touches, and the places it goes wrong.
        </p>
      </PageHeader>

      <Section
        title="The first one is a different product"
        description="Week one has no habit, no expectation and no reputation. It is the only recap that has to explain itself, and it is also the thinnest one anybody will ever get, because a new account has almost no history."
      >
        <div className="flex flex-wrap items-start gap-6">
          <FrameThumb
            width={190}
            candidate={byId('tags.newTerritory')}
            data={sampleData['tags.newTerritory']}
          />
          <div className="flex max-w-[34rem] flex-col gap-4">
            <Callout tone={CalloutTone.Good} title="Lead with a first, not a total">
              <p>
                A two-week-old account has small numbers, but every topic it
                touched is a first. The first recap opens on the most specific
                true thing about them, never on a total that would read as
                disappointing, and still ends on the forward frame.
              </p>
            </Callout>
            <Callout tone={CalloutTone.Bad} title="Do not gate it behind an explainer">
              <p>
                A modal explaining what Replay is, before showing any of it, is
                a tax on the one moment someone was curious. The first frame
                explains it by being it. One line in the closer is enough:
                &quot;every Monday, your week.&quot;
              </p>
            </Callout>
          </div>
        </div>
      </Section>

      <Section
        title="The loop, and where each step leaks"
        description="Five steps. Every one of them has a specific failure mode, and they compound: a 40% drop at each step leaves 8% of people at the share button."
      >
        <ol className="flex flex-col gap-px overflow-hidden rounded-16 border border-border-subtlest-tertiary">
          <Step
            n="01"
            title="Monday, in their timezone"
            body="The week closes and the recap generates. Generation is push, delivery is pull, so it waits for them rather than expiring."
            watch="Timezone drift. A recap that says Monday and arrives Sunday night for half of Europe undermines the whole cadence."
          />
          <Step
            n="02"
            title="They see the entry point"
            body="Hero card for the first month, inline card after that, header icon permanently. See the Placement story for the full comparison."
            watch="Banner blindness. This is the number to watch at week four, not week one."
          />
          <Step
            n="03"
            title="They open the story"
            body="Three to eight frames plus a closer. Tap through, resumable, no forced auto-advance."
            watch="Frame one. If the hook is a stat rather than an identity claim, half of them leave before frame two."
          />
          <Step
            n="04"
            title="They share a frame"
            body="Per-frame buttons, four channels, and an achievement unlocks on the first share."
            watch="The mobile share sheet. A blob download is inert inside an in-app browser, which is where a lot of these sessions live."
          />
          <Step
            n="05"
            title="Somebody else arrives"
            body="The posted frame carries the mark, the week and a per-user short link. A stranger lands on signup."
            watch="Attribution. Social is already 1.6% of traffic and effectively unattributed. If the short link is not per-user, we learn nothing."
          />
        </ol>
      </Section>

      <Section
        title="Every surface it touches"
        description="The recap is not one screen. Deciding what it does on each surface is most of the design work left."
      >
        <Table
          head={['Surface', 'What it does', 'Phase']}
          minWidth={58}
          rows={[
            [
              <span className="font-bold text-text-primary">Feed</span>,
              'The entry point. Hero card, then inline card.',
              'P1',
            ],
            [
              <span className="font-bold text-text-primary">Header and mobile nav</span>,
              'A permanent home with an unread dot. Turns the recap from an interruption into a place.',
              'P1',
            ],
            [
              <span className="font-bold text-text-primary">The story itself</span>,
              'Full screen, dark, per-frame sharing.',
              'P1',
            ],
            [
              <span className="font-bold text-text-primary">
                <Mono>/replay</Mono> archive
              </span>,
              'Every past week, kept. This is what makes the header icon worth having, and it costs almost nothing once recaps are stored.',
              'P2',
            ],
            [
              <span className="font-bold text-text-primary">Profile</span>,
              'The share achievement and any Top reader badges earned, showcased. The reward has to be visible somewhere permanent or it is not a reward.',
              'P2',
            ],
            [
              <span className="font-bold text-text-primary">Notification</span>,
              'Monday push, naming the single best highlight rather than saying "your recap is ready".',
              'P3',
            ],
            [
              <span className="font-bold text-text-primary">Email</span>,
              'The same, for people who do not have push. Frame one renders as the hero image.',
              'P3',
            ],
          ]}
        />
        <Callout tone={CalloutTone.Good} title="The archive is the quiet unlock">
          <p>
            Once every recap is stored, <Mono>/replay</Mono> becomes a personal
            history nobody else has: fifty-two weeks of who you were as a
            developer. That is also the raw material for the annual edition, and
            it is the reason the header icon earns its slot.
          </p>
        </Callout>
      </Section>

      <Section
        title="The edges"
        description="Each of these is a real user on a real Monday, and each one has a wrong answer that is easy to ship by accident."
      >
        <Table
          head={['Situation', 'What they get', 'The wrong answer']}
          minWidth={62}
          rows={[
            [
              'Read nothing all week',
              'Guaranteed frames only: what the ecosystem did, and what they are close to. Three frames, no scolding.',
              'Suppressing it. The quietest week belongs to the person most worth re-engaging.',
            ],
            [
              'Away eleven days',
              'Catch-up mode. The window becomes the absence, and the copy names it.',
              'Handing them last Monday’s recap as though they had seen it.',
            ],
            [
              'Away three weeks',
              'One catch-up recap, capped at 28 days.',
              'Three recaps queued up. Nobody watches the second one.',
            ],
            [
              'Brand new account',
              'The world frames carry it, and the closer explains the cadence.',
              'An empty state that says "come back next week".',
            ],
            [
              'Lost their streak',
              'The catch-up frame says it first, with the recovery path attached.',
              'Letting them find out from the streak page after the recap congratulated them on something else.',
            ],
            [
              'Visits every day',
              'One interruption on their first session of the week, then a collapsed row.',
              'The same full card six days running.',
            ],
            [
              'Dismissed it',
              'Nothing until next Monday.',
              'A re-prompt on Wednesday.',
            ],
            [
              'Does not want it at all',
              'A setting that turns it off, and the header icon still works if they go looking.',
              'No setting. A weekly interruption with no off switch is a support ticket.',
            ],
          ]}
        />
      </Section>

      <Section
        title="After the share"
        description="The step everyone forgets. Sharing is the goal, so the moment after it has to be worth something."
      >
        <div className="grid gap-4 tablet:grid-cols-3">
          <Cell label="Immediately" note="In the story">
            <Callout tone={CalloutTone.Good} title="The achievement fires">
              <p>
                Not a toast that says &quot;shared!&quot;. An achievement
                unlocks, with the artwork, and it is showcaseable on their
                profile.
              </p>
            </Callout>
          </Cell>
          <Cell label="Next Monday" note="In the recap">
            <Callout tone={CalloutTone.Good} title="It comes back as a frame">
              <p>
                The Signal Boost achievement unlocked on Monday is a Crown frame
                in next week&apos;s recap. The reward for sharing becomes the
                reason to share again, with no second feature built.
              </p>
            </Callout>
          </Cell>
          <Cell label="Whenever" note="On the profile">
            <Callout title="It stays visible">
              <p>
                Badges and achievements already showcase on the profile. If the
                reward is not visible somewhere permanent, it is a notification
                rather than a reward.
              </p>
            </Callout>
          </Cell>
        </div>
      </Section>

      <Section title="What I still do not know">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Bad} title="Whether weekly is the right cadence at all">
            <p>
              Week-four open rate is the number that answers it. If people who
              opened week one are not opening week four, the honest move is to
              slow to monthly rather than add frames, and let the annual edition
              carry the ceremony.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Whether the standing numbers can be honest">
            <p>
              &quot;Top 2% of Kubernetes readers&quot; is the strongest line on
              any frame, and it is only true if the denominator is real. If it
              quietly means top 2% of the forty people who read Kubernetes that
              week, the frame is a lie and somebody will work it out in public.
            </p>
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};
