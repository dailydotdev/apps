import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { RealCard, typeSampler } from './swap';
import type { Concept } from './concepts';
import { ALL_CONCEPTS, CONCEPTS, conceptById } from './concepts';
import type { Device, FrameArgs } from './frames';
import {
  DEVICES,
  Frame,
  FrameQueue,
  GRID_DEVICES,
  Toggle,
  Wipe,
} from './frames';
import { GEOMETRY } from './shell';

/* ------------------------------------------------------------------------ */
/* Page furniture                                                            */
/* ------------------------------------------------------------------------ */

const Page = ({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="min-h-screen bg-background-default px-8 py-10 text-text-primary">
    <h1 className="mb-2 font-bold typo-title1">{title}</h1>
    {intro && (
      <div className="mb-8 max-w-3xl text-pretty text-text-tertiary typo-callout">
        {intro}
      </div>
    )}
    {children}
  </div>
);

const fitScale = (device: Device, max = 1120): number =>
  Math.min(1, max / device.width);

const ConceptNotes = ({ concept }: { concept: Concept }): ReactElement => (
  <div className="flex max-w-xl flex-col gap-3">
    <div>
      <h2 className="font-bold typo-title3">{concept.name}</h2>
      <p className="text-text-quaternary typo-footnote">
        Seen at {concept.seenAt}
      </p>
    </div>
    <p className="text-pretty text-text-secondary typo-callout">
      {concept.idea}
    </p>
    {concept.why.length > 0 && (
      <ul className="list-disc pl-5 text-text-tertiary typo-footnote">
        {concept.why.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    )}
    <ul className="list-disc pl-5 text-accent-bun-default typo-footnote">
      {concept.risks.map((r) => (
        <li key={r}>{r}</li>
      ))}
    </ul>
  </div>
);

const GAPS = [
  { value: '32', label: '32 · today' },
  { value: '24', label: '24' },
  { value: '20', label: '20' },
  { value: '16', label: '16' },
  { value: '12', label: '12' },
];

const SIDES = [
  { value: '40', label: '40 · today' },
  { value: '32', label: '32' },
  { value: '24', label: '24' },
  { value: '16', label: '16' },
];

const SIDEBARS = [
  { value: 'open', label: 'Sidebar open' },
  { value: 'closed', label: 'Sidebar closed' },
] as const;

const Controls = ({ children }: { children: ReactNode }) => (
  <div
    className="sticky top-0 mb-8 flex flex-wrap items-center gap-4 border-b border-border-subtlest-tertiary bg-background-default py-3"
    style={{ zIndex: 2 }}
  >
    {children}
  </div>
);

const ControlLabel = ({ children }: { children: ReactNode }) => (
  <span className="font-bold text-text-tertiary typo-caption1">{children}</span>
);

/** Each device as a wipe between two frame configurations. */
const DeviceWipes = ({
  before,
  after,
  devices = DEVICES,
}: {
  before: FrameArgs;
  after: FrameArgs;
  devices?: Device[];
}): ReactElement => (
  <FrameQueue>
    <div className="flex flex-col gap-12">
      {devices.map((device, i) => (
        <section key={device.name}>
          <h3 className="mb-3 font-bold typo-body">
            {device.name} · {device.width}px
          </h3>
          <Wipe
            key={JSON.stringify([before, after])}
            before={before}
            after={after}
            device={device}
            scale={fitScale(device)}
            index={i * 2}
          />
        </section>
      ))}
    </div>
  </FrameQueue>
);

/* ------------------------------------------------------------------------ */
/* Overview                                                                  */
/* ------------------------------------------------------------------------ */

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
    <p className="mb-1 font-bold typo-callout">{title}</p>
    <p className="text-pretty text-text-tertiary typo-footnote">{children}</p>
  </div>
);

export const Overview = (): ReactElement => (
  <Page
    title="Card actions"
    intro={
      <>
        Ido, after the impressions count won (Oct 2026): make the feed card’s
        engagement buttons bigger again. Making them bigger by itself looked
        busy and inconsistent, so this exploration looks at the whole system —
        the bar, the feed’s spacing, and what other products do. Every page uses
        the <b>real production cards</b> with{' '}
        <b>real posts from the live feed</b> (40 posts, fetched 2026-10-08);
        only the action bar is swapped, in Storybook. No production code
        changes.
      </>
    }
  >
    <h2 className="mb-3 font-bold typo-title3">What we learned</h2>
    <ul className="mb-8 flex max-w-3xl list-disc flex-col gap-2 pl-5 text-text-secondary typo-callout">
      <li>
        <b>The narrowest real card is 289px.</b> In the production layout (40px
        margins, 32px gap, columns set by the width left after the sidebar) the
        smallest grid card is 289px at six columns and 292px at three — not the
        272px the August shrink (#6394) assumed.
      </li>
      <li>
        <b>Today’s bar fits at 32px.</b> Same order, style and numbers, with
        32px buttons and 20px icons: it fits every real post at today’s gap.
        Posts with the largest possible counts need a 24px gap (20px leaves
        spare). See Fit check and Gap sheet.
      </li>
      <li>
        <b>Card height never changes.</b> Every variant keeps production’s 36px
        bar row; tap areas reach 44px without taking layout space.
      </li>
      <li>
        <b>
          None of the products we measured or read the code of shows six equal
          actions on a card this size.
        </b>{' '}
        They group them (counts left, personal actions right, as Bluesky and
        Medium do) or show some on hover (Dribbble, Behance) — the two shapes
        the shortlist takes.
      </li>
      <li>
        <b>Number rule:</b> one decimal only under 10 (1.7K, 9.9K), whole
        numbers above (23K, 234K), rounded down — what Bluesky and Mastodon do.
      </li>
    </ul>

    <h2 className="mb-3 font-bold typo-title3">The shortlist</h2>
    <div className="mb-10 grid max-w-5xl gap-4 laptop:grid-cols-2">
      {CONCEPTS.map((c) => (
        <Card key={c.id} title={c.name}>
          {c.idea}
        </Card>
      ))}
    </div>

    <h2 className="mb-3 font-bold typo-title3">How this folder is organised</h2>
    <div className="grid max-w-5xl gap-4 laptop:grid-cols-2">
      <Card title="1. Decide">
        Overview (this page) · Compare: every variant at every gap, side by side
        · Fit check: the width each variant needs on all 40 posts, and its card
        height · Gap sheet: today’s bar at 24px vs 32px, gap by gap.
      </Card>
      <Card title="2. Explore">
        Feed gap before / after (wipe slider) · Variants on every card type · A
        variant in the feed, at six widths including tablet and phone · Lab.
      </Card>
      <Card title="3. Research">
        How 15 products organise card actions, their gutters, and the rules with
        numbers, with sources.
      </Card>
      <Card title="Archive · round 1">
        The first pass: 12 bar and spacing variants on a single demo post, the
        number rule, and the spacing ladder.
      </Card>
    </div>
  </Page>
);

/* ------------------------------------------------------------------------ */
/* 2. Feed gap                                                               */
/* ------------------------------------------------------------------------ */

export const FeedGap = (): ReactElement => {
  const [gap, setGap] = useState('20');
  const [side, setSide] = useState('40');
  const [sidebar, setSidebar] = useState<'open' | 'closed'>('open');
  const [concept, setConcept] = useState('today');
  const before: FrameArgs = {
    concept: 'today',
    gap: GEOMETRY.gap,
    side: GEOMETRY.padding,
    sidebar,
  };
  const after: FrameArgs = {
    concept,
    gap: Number(gap),
    side: Number(side),
    sidebar,
  };
  return (
    <Page
      title="Feed gap — before / after"
      intro="Left of the handle is production today (32px gap, 40px margins). Right of it is the spacing you pick. Drag the slider under each frame. Every frame is the shell at that real viewport width, so columns change where the app changes them. Grid widths only: below 1,020px production shows list cards, where the gap does not apply."
    >
      <Controls>
        <ControlLabel>Gap</ControlLabel>
        <Toggle options={GAPS} value={gap} onChange={setGap} />
        <ControlLabel>Margins</ControlLabel>
        <Toggle options={SIDES} value={side} onChange={setSide} />
        <Toggle
          options={[...SIDEBARS]}
          value={sidebar}
          onChange={(v) => setSidebar(v as 'open' | 'closed')}
        />
        <ControlLabel>Bar on the right</ControlLabel>
        <select
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          className="rounded-10 bg-surface-float px-2 py-1 text-text-primary typo-footnote"
        >
          {ALL_CONCEPTS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Controls>
      <DeviceWipes before={before} after={after} devices={GRID_DEVICES} />
    </Page>
  );
};

/* ------------------------------------------------------------------------ */
/* 3. Concepts on every card type                                            */
/* ------------------------------------------------------------------------ */

const CARD = 292;

const TypeRow = ({ concept }: { concept: Concept }): ReactElement => (
  <div className="flex flex-wrap gap-6">
    {typeSampler.map(({ label, post }) => (
      <div key={label} style={{ width: CARD }}>
        <p className="mb-2 font-bold text-text-tertiary typo-caption1">
          {label}
        </p>
        <RealCard post={post} slots={concept.slots} />
      </div>
    ))}
  </div>
);

export const ConceptsGallery = (): ReactElement => {
  const [showReach, setShowReach] = useState(false);
  return (
    <Page
      title="Variants on every card type"
      intro={`Each variant on four real posts — an article, a share, a post and a video — at ${CARD}px, the narrowest grid card production renders (1,260px window, sidebar open, three columns). Hover a card, click the buttons. Today first, for reference.`}
    >
      <style>{`.show-reach .reach::after { outline: 1px dashed var(--theme-accent-cabbage-default); }`}</style>
      <Controls>
        <Toggle
          options={[
            { value: 'off', label: 'Hide tap areas' },
            { value: 'on', label: 'Show tap areas' },
          ]}
          value={showReach ? 'on' : 'off'}
          onChange={(v) => setShowReach(v === 'on')}
        />
      </Controls>
      <div
        className={classNames(
          'flex flex-col gap-16',
          showReach && 'show-reach',
        )}
      >
        {ALL_CONCEPTS.map((concept) => (
          <section
            key={concept.id}
            className="flex flex-col gap-6 border-t border-border-subtlest-tertiary pt-8"
          >
            <ConceptNotes concept={concept} />
            <TypeRow concept={concept} />
          </section>
        ))}
      </div>
    </Page>
  );
};

/* ------------------------------------------------------------------------ */
/* 4. A concept in the feed                                                  */
/* ------------------------------------------------------------------------ */

export const ConceptInFeed = (): ReactElement => {
  const [concept, setConcept] = useState(CONCEPTS[0].id);
  const [gap, setGap] = useState('32');
  const current = conceptById(concept);
  return (
    <Page
      title="A variant in the feed"
      intro="Pick a variant and a gap. Left of each handle is today; right is the variant. Same posts, same breakpoints."
    >
      <Controls>
        <Toggle
          options={CONCEPTS.map((c) => ({
            value: c.id,
            label: c.name.split(' ')[0].replace(/\.$/, ''),
          }))}
          value={concept}
          onChange={setConcept}
        />
        <ControlLabel>Gap</ControlLabel>
        <Toggle options={GAPS} value={gap} onChange={setGap} />
      </Controls>
      <div className="mb-10">
        <ConceptNotes concept={current} />
      </div>
      <DeviceWipes
        before={{ concept: 'today', gap: GEOMETRY.gap, side: GEOMETRY.padding }}
        after={{ concept, gap: Number(gap), side: GEOMETRY.padding }}
      />
    </Page>
  );
};

/* ------------------------------------------------------------------------ */
/* 6. Lab                                                                    */
/* ------------------------------------------------------------------------ */

export interface LabArgs extends FrameArgs {
  device: string;
}

const LAPTOP = DEVICES[0];

export const Lab = ({ device, ...args }: LabArgs): ReactElement => {
  const d = DEVICES.find((x) => x.name === device) ?? LAPTOP;
  return (
    <Page title="Lab" intro="Every knob is in Controls.">
      <FrameQueue>
        <Frame
          key={JSON.stringify(args) + device}
          args={args}
          device={d}
          scale={fitScale(d, 1400)}
          index={0}
          title="Lab"
        />
      </FrameQueue>
    </Page>
  );
};
