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
import { DESIGN_WIDTH, FrameStyles, FrameThumb } from './frames';
import { sampleData } from './data';

const meta: Meta = {
  title: 'Replay/07. Sharing',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'What leaves the app, in what shape, and what the sharer gets back for it.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const HERO = byId('crown.topReader');

/** The three crops a frame is exported at. */
const CROPS = [
  {
    name: 'Story',
    ratio: '9:16',
    pixels: '1080 × 1920',
    where: 'Instagram and WhatsApp status, TikTok, LinkedIn stories',
    width: 150,
    height: (150 * 16) / 9,
  },
  {
    name: 'Square',
    ratio: '1:1',
    pixels: '1080 × 1080',
    where: 'Instagram feed, Slack, Discord',
    width: 200,
    height: 200,
  },
  {
    name: 'Landscape',
    ratio: '1.91:1',
    pixels: '1200 × 630',
    where: 'X and LinkedIn timelines, and every link unfurl',
    width: 260,
    height: 260 / 1.91,
  },
];

/**
 * The crops are approximated here by clipping the 9:16 canvas, which is exactly
 * what the export route should not do. Cropping proves the point that a 9:16
 * canvas cannot become a 1.91:1 image without a second layout.
 */
const Crop = ({
  width,
  height,
}: {
  width: number;
  height: number;
}): React.ReactElement => (
  <div
    style={{
      width,
      height,
      overflow: 'hidden',
      position: 'relative',
      borderRadius: 10,
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: `calc(50% - ${(width * 16) / 9 / 2}px)`,
        left: 0,
      }}
    >
      <FrameThumb width={width} candidate={HERO} data={sampleData[HERO.id]} />
    </div>
  </div>
);

export const Sharing: Story = {
  render: () => (
    <Page>
      <FrameStyles />
      <PageHeader
        eyebrow="Replay"
        title="The frame is the product. The recap is the delivery mechanism."
      >
        <p>
          Everything upstream exists so that a developer posts one of these. If
          the share rate is zero, the recap is a pleasant retention feature and
          nothing more, so every decision in the viewer is made in favour of the
          image leaving the app.
        </p>
      </PageHeader>

      <Section
        title="Every frame carries the same four things"
        description="Non-negotiable, because the frame will be seen out of context by someone who has never heard of us."
      >
        <div className="flex flex-wrap items-start gap-8">
          <FrameThumb width={220} candidate={HERO} data={sampleData[HERO.id]} />
          <div className="flex max-w-[32rem] flex-col gap-4">
            <Cell label="The mark" note="Top right, always">
              <p className="text-text-tertiary typo-footnote">
                Small enough not to look like an advert, present enough that the
                screenshot is still attributable when someone crops the link off.
              </p>
            </Cell>
            <Cell label="The window" note="W37, or the year">
              <p className="text-text-tertiary typo-footnote">
                Dates the artifact. It is also what makes a second one worth
                posting: this is week 37, so there was a 36 and there will be a
                38.
              </p>
            </Cell>
            <Cell label="The handle" note="Theirs, not ours">
              <p className="text-text-tertiary typo-footnote">
                The artifact is about them. Their name on it is why they post it.
              </p>
            </Cell>
            <Cell label="A per-user short link" note="r.daily.dev/u/…">
              <p className="text-text-tertiary typo-footnote">
                The only attribution we will get. Social is currently 1.6% of
                traffic and effectively unattributed, so a per-user code on the
                artifact is the measurement, not just the referral.
              </p>
            </Cell>
          </div>
        </div>
      </Section>

      <Section
        title="Two exports from one layout"
        description="Developers post to X and LinkedIn more than to Stories, and both crop a 9:16 hard: X to 2:1 in the timeline, LinkedIn to 4:5. Every card is authored in container units with its content spread by space-between, so the same frame renders at 4:5 without a second layout. The share sheet exports both."
      >
        <div className="flex flex-wrap items-end gap-8">
          {['persona.week', 'rank.topicReader', 'reading.grid'].map((id) => (
            <div key={id} className="flex items-end gap-4">
              <Cell label="9:16" note="Stories, in-app">
                <FrameThumb width={168} candidate={byId(id)} data={sampleData[id]} />
              </Cell>
              <Cell label="4:5" note="X, LinkedIn">
                <FrameThumb width={168} aspect="4:5" candidate={byId(id)} data={sampleData[id]} />
              </Cell>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Three crops, not one image scaled"
        description="A 9:16 canvas letterboxed into a timeline is the single most common way this gets shipped badly. Each crop is a layout, and the export route picks the layout, not the scale."
      >
        <div className="flex flex-wrap items-end gap-8">
          {CROPS.map((crop) => (
            <Cell
              key={crop.name}
              label={`${crop.name} · ${crop.ratio}`}
              note={crop.pixels}
            >
              <Crop width={crop.width} height={crop.height} />
              <span className="block max-w-[16rem] text-text-quaternary typo-caption2">
                {crop.where}
              </span>
            </Cell>
          ))}
        </div>
        <Callout tone={CalloutTone.Bad} title="What these mock-ups are showing you">
          <p>
            The square and landscape crops here are the 9:16 canvas clipped,
            which is exactly what the export must not do. The headline survives
            and everything else is cut. Each ratio needs its own arrangement of
            the same content, which is a real cost and worth knowing before it is
            committed to.
          </p>
        </Callout>
      </Section>

      <Section
        title="Export runs server-side"
        description="Not client-side html-to-image."
      >
        <Table
          head={['Decision', 'Why']}
          minWidth={44}
          rows={[
            [
              'A signed route renders the canvas',
              'Fonts, emoji and gradients render identically for everyone. Client-side capture drifts per browser, and the mobile share sheet is where most of these will be posted.',
            ],
            [
              <Mono>{`canvas authored at ${DESIGN_WIDTH}px, exported at 3×`}</Mono>,
              'One authoring width, one scale factor. Every preview in this Storybook is that same canvas scaled, so a thumbnail here is honest about what gets posted.',
            ],
            [
              'The viewer cannot trigger a download',
              'Save image has to go through the native share sheet on mobile. A blob download link is inert inside an in-app browser, which is where a good share of these sessions will be.',
            ],
          ]}
        />
      </Section>

      <Section
        title="Sharing pays the sharer"
        description="Duolingo rewards a shared Year in Review with a themed badge, and it moved their share rate. We already own the machinery."
      >
        <div className="grid gap-4 tablet:grid-cols-3">
          <Callout tone={CalloutTone.Good} title="An achievement, not a coupon">
            <p>
              <Mono>userAchievements</Mono> already carries art, rarity, unlock
              time and profile showcase. A Signal Boost achievement for sharing
              costs one row in the achievements table.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Good} title="It compounds">
            <p>
              An achievement unlocked on Monday is a Crown frame in next
              week&apos;s recap. The reward for sharing becomes the reason to
              share again, without anyone writing a second feature.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Not Cores, not Plus">
            <p>
              Paying for shares buys shares from people who do not mean it, and
              the artifact stops reading as genuine the moment anyone suspects it
              was bought.
            </p>
          </Callout>
        </div>
      </Section>

      <Section
        title="What to measure"
        description="One north star, and the guardrail that tells us we made the feed worse."
      >
        <Table
          head={['Metric', 'Definition', 'Why this one']}
          minWidth={56}
          rows={[
            [
              <span className="font-bold text-text-primary">
                Signups per 1,000 recaps opened
              </span>,
              'Attributed through the per-user short link on the frame.',
              'The north star. Everything else is a proxy for it.',
            ],
            [
              'Share rate',
              'Recaps where at least one frame was shared, over recaps opened.',
              'The lever we actually control. Frame design and per-frame buttons move this.',
            ],
            [
              'Open rate',
              'Recaps opened over feed cards seen.',
              'Decided almost entirely by the card face, which is why the card is frame one.',
            ],
            [
              'Week-four open rate',
              'Of people who opened week one, how many still open week four.',
              'The single number that says whether novelty decay is working. If this falls off a cliff, the catalog is too thin.',
            ],
            [
              'Frames per session',
              'How far into the story people get.',
              'Tells us whether the order is right and where to put the strongest frame.',
            ],
            [
              <span className="text-accent-ketchup-default">
                Feed engagement delta
              </span>,
              'Post CTR on feeds with the card versus without.',
              'The guardrail. The card occupies a slot that would otherwise be a post, and it has to earn it.',
            ],
          ]}
        />
      </Section>
    </Page>
  ),
};
