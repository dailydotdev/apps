import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { Callout, CalloutTone, Mono, Page, PageHeader, Section } from './shell';
import { profiles, sampleData } from './data';
import { FrameStyles, FrameThumb } from './frames';
import { FeedCard } from './FeedCard';
import { DeliveryState, Eligibility, resolveDelivery, select, storyFrames } from './ranking';
import { StoryPlayer } from './StoryPlayer';
import type { PlayerFrame } from './StoryPlayer';
import {
  defaultBubbles,
  HeaderBar,
  MockFeed,
  RecapStrip,
  StoryTray,
} from './FeedMocks';
import type { Person } from './people';

const meta: Meta = {
  title: 'Replay/11. Playground',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Walk the whole journey. Pick who you are and where the entry point sits, then click through from feed to share.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

/* -------------------------------------------------------------------------- */
/* Controls                                                                    */
/* -------------------------------------------------------------------------- */

const Segmented = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
}): React.ReactElement => (
  <div className="flex min-w-0 flex-col gap-2">
    <span className="uppercase tracking-[0.12em] text-text-quaternary typo-caption2">
      {label}
    </span>
    <div className="flex flex-wrap gap-1 rounded-12 bg-surface-float p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={classNames(
            'rounded-8 px-3 py-1.5 typo-footnote transition-colors',
            option.value === value
              ? 'bg-text-primary font-bold text-surface-invert'
              : 'text-text-tertiary hover:text-text-primary',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Intent                                                                      */
/* -------------------------------------------------------------------------- */

type Step = 'feed' | 'story' | 'shared' | 'after';

const INTENT: Record<
  Step,
  { title: string; them: string; us: string; risk: string }
> = {
  feed: {
    title: 'They are here to read, not to be celebrated',
    them: 'Opened the app for two minutes between meetings. They want something to read, and they are already scrolling.',
    us: 'Interrupt exactly once, with a real fact rather than a promise, and make the first frame do the selling.',
    risk: 'Banner blindness. By week four the card is furniture unless its face keeps changing.',
  },
  story: {
    title: 'Curiosity, with a very short fuse',
    them: 'They tapped because something specific caught them. They will give it about four seconds before deciding whether to keep going.',
    us: 'Open on the identity claim, build, and land the strongest frame last. Never auto-advance past something they might want to post.',
    risk: 'Frame one being a statistic. If it is a number rather than a claim about who they are, half of them leave.',
  },
  shared: {
    title: 'The whole initiative is this second',
    them: 'They found something true about themselves that makes them look good, and they want their timeline to see it.',
    us: 'Get the image out with the mark, the week and a per-user link on it, and pay them for doing it.',
    risk: 'Friction. A share sheet that fails silently on mobile loses the only moment that matters.',
  },
  after: {
    title: 'They go back to what they came for',
    them: 'Done. They want the feed back, not another prompt.',
    us: 'Collapse to a row, bank the achievement, and say nothing else until Monday.',
    risk: 'Re-prompting. A second nudge in the same week is how a weekly feature becomes a muted one.',
  },
};

const IntentPanel = ({ step }: { step: Step }): React.ReactElement => {
  const intent = INTENT[step];

  return (
    <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5">
      <div className="flex flex-col gap-1">
        <span className="uppercase tracking-[0.12em] text-accent-cabbage-default typo-caption2">
          Intent at this step
        </span>
        <span className="font-bold text-text-primary typo-title3">
          {intent.title}
        </span>
      </div>
      <div className="grid gap-4 tablet:grid-cols-3">
        {[
          ['What they want', intent.them, 'text-text-primary'],
          ['What we want', intent.us, 'text-text-primary'],
          ['Where it breaks', intent.risk, 'text-accent-ketchup-default'],
        ].map(([label, body, tone]) => (
          <div key={label} className="flex flex-col gap-1.5">
            <span
              className={classNames(
                'font-bold uppercase tracking-[0.1em] typo-caption2',
                tone,
              )}
            >
              {label}
            </span>
            <span className="text-text-tertiary typo-footnote">{body}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Playground                                                                  */
/* -------------------------------------------------------------------------- */

type Placement = 'hero' | 'inline' | 'tray' | 'strip';

const STEP_ORDER: Step[] = ['feed', 'story', 'shared', 'after'];

const Simulator = (): React.ReactElement => {
  const [personaId, setPersonaId] = useState(profiles[0].id);
  const [placement, setPlacement] = useState<Placement>('hero');
  const [day, setDay] = useState('7');
  const [step, setStep] = useState<Step>('feed');
  const [shared, setShared] = useState<string[]>([]);

  const profile = profiles.find((item) => item.id === personaId) ?? profiles[0];

  const person: Person = {
    login: profile.login,
    name: profile.name,
    handle: profile.handle,
  };

  const selection = useMemo(
    () =>
      select({
        mode: profile.mode,
        signals: profile.signals,
        lastShown: profile.lastShown,
        opens: profile.opens,
        impressions: profile.impressions,
      }),
    [profile],
  );

  const frames: PlayerFrame[] = useMemo(
    () =>
      storyFrames(selection).map((candidate) => ({
        candidate,
        data: sampleData[candidate.id],
      })),
    [selection],
  );

  const delivery = resolveDelivery({
    now: new Date(2026, 8, Number(day), 9),
    lastVisitAt: new Date(
      2026,
      8,
      Number(day) - Math.max(1, profile.daysAway),
      9,
    ),
    handledWeek: null,
  });

  // The entry point shows the strongest highlight, not the opener: the opener
  // is the establishing shot inside the story, and a card face has to carry a
  // real fact to be worth tapping.
  const hero = selection.frames[0]?.candidate ?? frames[0]?.candidate;
  const open = () => setStep('story');
  const reset = () => {
    setStep('feed');
    setShared([]);
  };

  const entry = (() => {
    if (placement === 'inline') {
      return null;
    }
    if (placement === 'tray') {
      return (
        <button type="button" onClick={open} className="w-full text-left">
          <StoryTray bubbles={defaultBubbles.slice(0, frames.length - 1)} />
        </button>
      );
    }
    if (placement === 'strip') {
      return (
        <button type="button" onClick={open} className="w-full text-left">
          <RecapStrip count={selection.frames.length} />
        </button>
      );
    }
    return (
      <div className="flex w-full items-center gap-5 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5">
        <FrameThumb
          width={124}
          candidate={hero}
          data={sampleData[hero.id]}
          person={person}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="uppercase tracking-[0.14em] text-text-quaternary typo-caption2">
            Replay · {delivery.key}
          </span>
          <span className="font-bold text-text-primary typo-title3">
            {sampleData[hero.id]?.headline ?? hero.headline}
          </span>
          <span className="text-text-tertiary typo-callout">
            {selection.frames.length} moments waiting.
          </span>
          <button
            type="button"
            onClick={open}
            className="mt-1 w-fit rounded-10 bg-text-primary px-3 py-1.5 font-bold text-surface-invert typo-footnote"
          >
            Open your week
          </button>
        </div>
      </div>
    );
  })();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-6 rounded-16 border border-border-subtlest-tertiary bg-background-default p-5">
        <Segmented
          label="Who"
          value={personaId}
          onChange={(next) => {
            setPersonaId(next);
            reset();
          }}
          options={profiles.map((item) => ({
            value: item.id,
            label: item.name.split(' ')[0],
          }))}
        />
        <Segmented
          label="Entry point"
          value={placement}
          onChange={(next) => {
            setPlacement(next);
            reset();
          }}
          options={[
            { value: 'hero', label: 'Hero' },
            { value: 'inline', label: 'Inline' },
            { value: 'tray', label: 'Tray' },
            { value: 'strip', label: 'Strip' },
          ]}
        />
        <Segmented
          label="Day they arrive"
          value={day}
          onChange={(next) => {
            setDay(next);
            reset();
          }}
          options={[
            { value: '7', label: 'Mon' },
            { value: '9', label: 'Wed' },
            { value: '12', label: 'Sat' },
          ]}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="uppercase tracking-[0.12em] text-text-quaternary typo-caption2">
            Engine says
          </span>
          <span className="text-text-tertiary typo-footnote">
            <Mono>{delivery.mode}</Mono> · <Mono>{selection.eligibility}</Mono>{' '}
            · {selection.frames.length} cards · {delivery.reason}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STEP_ORDER.map((item, index) => (
          <React.Fragment key={item}>
            {index > 0 && (
              <span className="text-text-quaternary typo-footnote">→</span>
            )}
            <button
              type="button"
              onClick={() => setStep(item)}
              className={classNames(
                'rounded-10 px-3 py-1.5 capitalize typo-footnote',
                step === item
                  ? 'bg-accent-cabbage-default font-bold text-white'
                  : 'bg-surface-float text-text-tertiary',
              )}
            >
              {index + 1}. {item}
            </button>
          </React.Fragment>
        ))}
        <button
          type="button"
          onClick={reset}
          className="ml-auto rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 text-text-tertiary typo-footnote"
        >
          Start over
        </button>
      </div>

      <IntentPanel step={step} />

      {step === 'feed' && selection.eligibility === Eligibility.None && (
        <div className="flex flex-col gap-4">
          <Callout tone={CalloutTone.Bad} title="No Replay this week">
            <p>
              {profile.name} opened nothing this week, so there is nothing true
              to say about them and nothing to compare. The eligibility ladder
              returns nothing and the feed card does not render. An empty recap
              is worse than none.
            </p>
          </Callout>
          <MockFeed count={6} />
        </div>
      )}

      {step === 'feed' && selection.eligibility !== Eligibility.None && (
        <MockFeed
          above={entry}
          at={3}
          injected={
            placement === 'inline' ? (
              <FeedCard
                candidate={hero}
                data={sampleData[hero.id]}
                person={person}
                state={DeliveryState.Available}
                frameCount={selection.frames.length}
                onOpen={open}
              />
            ) : undefined
          }
        />
      )}

      {step === 'story' && (
        <div className="flex flex-wrap items-start gap-8 rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
          <div className="w-[22rem] max-w-full">
            <StoryPlayer
              frames={frames}
              person={person}
              windowLabel={delivery.key.replace('2026-', '')}
              onShare={(id, channel) => {
                setShared((value) => [`${channel} · ${id}`, ...value]);
                setStep('shared');
              }}
              onClose={() => setStep('after')}
            />
          </div>
          <div className="flex min-w-[16rem] flex-1 flex-col gap-3">
            <span className="font-bold text-text-primary typo-callout">
              {profile.name}&apos;s {selection.frames.length} frames
            </span>
            <ol className="flex flex-col gap-1.5">
              {frames.map((frame, index) => (
                <li
                  key={frame.candidate.id}
                  className="flex items-center gap-2 text-text-tertiary typo-caption1"
                >
                  <span className="w-4 font-mono text-text-quaternary">
                    {index + 1}
                  </span>
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: frame.candidate.hue }}
                  />
                  <span className="truncate font-mono">
                    {frame.candidate.id}
                  </span>
                </li>
              ))}
            </ol>
            <span className="text-text-quaternary typo-caption2">
              Tap the right two thirds of the frame to advance, the left third to
              go back, or use the arrow keys. Sharing any frame moves the journey
              on.
            </span>
          </div>
        </div>
      )}

      {step === 'shared' && (
        <div className="flex flex-wrap items-start gap-8 rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
          <FrameThumb
            width={190}
            candidate={frames[0].candidate}
            data={sampleData[frames[0].candidate.id]}
            person={person}
          />
          <div className="flex min-w-[18rem] flex-1 flex-col gap-4">
            <Callout tone={CalloutTone.Good} title="It left the app">
              <p>
                {shared[0] ?? 'Shared'} — carrying the mark, the week label and a
                per-user short link. That link is the only attribution we will
                get, and it is why it has to be per-user rather than generic.
              </p>
            </Callout>
            <Callout tone={CalloutTone.Good} title="And it paid them">
              <p>
                The Signal Boost achievement unlocks, showcaseable on their
                profile. Next Monday it comes back as a Crown frame in their own
                recap, which is the loop closing without a second feature.
              </p>
            </Callout>
            <button
              type="button"
              onClick={() => setStep('after')}
              className="w-fit rounded-10 bg-text-primary px-3 py-1.5 font-bold text-surface-invert typo-footnote"
            >
              Back to the feed
            </button>
          </div>
        </div>
      )}

      {step === 'after' && (
        <MockFeed
          above={<HeaderBar unread={false} />}
          at={3}
          injected={
            <FeedCard
              candidate={hero}
              data={sampleData[hero.id]}
              person={person}
              state={DeliveryState.Seen}
              frameCount={selection.frames.length}
              onOpen={() => setStep('story')}
            />
          }
        />
      )}
    </div>
  );
};

export const Playground: Story = {
  render: () => (
    <Page>
      <FrameStyles />
      <PageHeader eyebrow="Replay" title="Walk the whole thing">
        <p>
          Pick who you are, where the entry point sits and which day they turn
          up, then click through from feed to share and back. The engine runs
          live: the frame count, the delivery mode and the frames themselves all
          come from <Mono>select()</Mono> and <Mono>resolveDelivery()</Mono>, not
          from a script.
        </p>
        <p>
          The panel under the controls is the part worth arguing with. It says
          what the person wants at each step, what we want, and the specific way
          it breaks.
        </p>
      </PageHeader>
      <Section title="Simulator">
        <Simulator />
      </Section>
    </Page>
  ),
};
