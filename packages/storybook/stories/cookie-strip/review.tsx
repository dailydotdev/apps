import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { Device } from './kit';
import { BELOW_STRIP_DEVICES, DEVICES } from './kit';
import type { FrameArgs, Theme } from './frames';
import { DeviceLabel, Frame, FrameQueue, Toggle, useWidth } from './frames';
import type { Variant } from './variants';
import { ALL, PRODUCTION, VARIANTS, variantById } from './variants';
import readme from './README.md?raw';

/* ------------------------------------------------------------------------ */
/* Controls shared by every review page                                      */
/* ------------------------------------------------------------------------ */

interface Controls {
  theme: Theme;
  copy: string;
  cookie: string;
  consent: string;
}

const useControls = () => {
  const [controls, setControls] = useState<Controls>({
    theme: 'dark',
    copy: 'geo',
    cookie: 'short',
    consent: 'open',
  });
  const set = (patch: Partial<Controls>) =>
    setControls((c) => ({ ...c, ...patch }));

  const bar = (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <Toggle
        label="Headline"
        value={controls.copy}
        onChange={(copy) => set({ copy })}
        options={[
          { value: 'geo', label: 'Geo (Israel)' },
          { value: 'default', label: 'Default' },
        ]}
      />
      <Toggle
        label="Cookie copy"
        value={controls.cookie}
        onChange={(cookie) => set({ cookie })}
        options={[
          { value: 'short', label: 'Short' },
          { value: 'tcf', label: 'TCF / EU' },
        ]}
      />
      <Toggle
        label="Cookie card"
        value={controls.consent}
        onChange={(consent) => set({ consent })}
        options={[
          { value: 'open', label: 'Showing' },
          { value: 'answered', label: 'Answered' },
        ]}
      />
      <Toggle
        label="Theme"
        value={controls.theme}
        onChange={(theme) => set({ theme })}
        options={[
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
        ]}
      />
    </div>
  );

  return { controls, bar };
};

const frameArgs = (variant: Variant, controls: Controls): FrameArgs => ({
  variant: variant.id,
  copy: controls.copy,
  cookie: controls.cookie,
  consent: controls.consent,
});

const LIVE_NOTE =
  'Every frame is a real browser viewport running the real production components. Accept, Reject or × answers the cookie card, as iubenda does, and the chip at the top brings it back.';

/* ------------------------------------------------------------------------ */
/* Layout                                                                    */
/* ------------------------------------------------------------------------ */

const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="min-h-screen bg-background-default p-8 text-text-primary">
    <div className="mx-auto flex max-w-[90rem] flex-col gap-8">{children}</div>
  </div>
);

const Eyebrow = ({ children }: { children: ReactNode }): ReactElement => (
  <p className="font-bold uppercase tracking-wider text-accent-cabbage-default typo-caption1">
    {children}
  </p>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex max-w-[56rem] flex-col gap-3">
    <h2 className="font-bold typo-title3">{title}</h2>
    {children}
  </section>
);

const Body = ({ children }: { children: ReactNode }): ReactElement => (
  <p className="text-text-secondary typo-body">{children}</p>
);

const Bullets = ({ items }: { items: ReactNode[] }): ReactElement => (
  <ul className="flex list-disc flex-col gap-1 pl-5 text-text-secondary typo-body">
    {items.map((item, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <li key={i}>{item}</li>
    ))}
  </ul>
);

const Tag = ({
  tone,
  children,
}: {
  tone: 'before' | 'after';
  children: ReactNode;
}) => (
  <span
    className={classNames(
      'rounded-6 px-1.5 font-bold typo-caption1',
      tone === 'before'
        ? 'bg-surface-float text-text-secondary'
        : 'border border-accent-cabbage-default text-accent-cabbage-default',
    )}
  >
    {children}
  </span>
);

/* ------------------------------------------------------------------------ */
/* Pages                                                                     */
/* ------------------------------------------------------------------------ */

const BeforeAfterRow = ({
  variant,
  device,
  controls,
  width,
  index,
}: {
  variant: Variant;
  device: Device;
  controls: Controls;
  width: number;
  index: number;
}): ReactElement => {
  const column = Math.max(0, (width - 24) / 2);
  return (
    <div className="flex flex-col gap-2">
      <DeviceLabel device={device} />
      <div className="grid grid-cols-2 gap-6">
        {[PRODUCTION, variant].map((v, i) => (
          <div key={v.id} className="flex flex-col gap-2">
            <Tag tone={i === 0 ? 'before' : 'after'}>
              {i === 0 ? 'Before · production' : `After · ${v.name}`}
            </Tag>
            <Frame
              title={`${v.name} at ${device.width}`}
              args={frameArgs(v, controls)}
              theme={controls.theme}
              device={device}
              width={column}
              index={index * 2 + i}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/** Production next to one variant, at every size. */
export const BeforeAfterPage = ({ id }: { id: string }): ReactElement => {
  const variant = variantById(id);
  const { controls, bar } = useControls();
  const [ref, width] = useWidth<HTMLDivElement>();
  return (
    <Page>
      <Eyebrow>Does it hold at every size, and leave mobile alone?</Eyebrow>
      <section className="flex flex-col gap-4">
        <h1 className="font-bold typo-title1">{variant.name}</h1>
        <p className="max-w-[48rem] text-text-secondary typo-body">
          {variant.idea}
        </p>
        <div className="flex max-w-[56rem] flex-col gap-2">
          <p className="font-bold typo-footnote">What changes</p>
          <Bullets items={variant.changes} />
          <p className="text-text-tertiary typo-callout">
            Copy, buttons, sign-in behavior, tracking and the laptop-only gate
            are production&apos;s, unchanged.
          </p>
        </div>
      </section>
      {bar}
      <p className="text-text-tertiary typo-footnote">{LIVE_NOTE}</p>
      <FrameQueue key={JSON.stringify(controls)}>
        <div ref={ref} className="flex flex-col gap-10">
          {[...DEVICES, ...BELOW_STRIP_DEVICES].map((device, i) => (
            <BeforeAfterRow
              key={device.width}
              variant={variant}
              device={device}
              controls={controls}
              width={width}
              index={i}
            />
          ))}
        </div>
      </FrameQueue>
    </Page>
  );
};

/** Production and every variant side by side at one size. */
export const ComparePage = (): ReactElement => {
  const { controls, bar } = useControls();
  const [deviceWidth, setDeviceWidth] = useState(1366);
  const devices = [...DEVICES, ...BELOW_STRIP_DEVICES];
  const device = devices.find((d) => d.width === deviceWidth) ?? DEVICES[0];
  const [ref, width] = useWidth<HTMLDivElement>();
  const column = Math.max(0, (width - 32) / 2);

  return (
    <Page>
      <Eyebrow>Which layout goes into the A/B test?</Eyebrow>
      <h1 className="font-bold typo-title1">
        Production and the three variants
      </h1>
      <div className="flex flex-col gap-3">
        <Toggle
          label="Device"
          value={String(deviceWidth)}
          onChange={(w) => setDeviceWidth(Number(w))}
          options={devices.map((d) => ({
            value: String(d.width),
            label: `${d.width}`,
          }))}
        />
        {bar}
      </div>
      <DeviceLabel device={device} />
      <FrameQueue key={`${deviceWidth}-${JSON.stringify(controls)}`}>
        <div ref={ref} className="grid grid-cols-2 gap-8">
          {ALL.map((variant, i) => (
            <div key={variant.id} className="flex flex-col gap-2">
              <p className="flex items-center gap-2 font-bold typo-callout">
                <Tag tone={i === 0 ? 'before' : 'after'}>
                  {i === 0 ? 'Before' : 'After'}
                </Tag>
                {variant.name}
              </p>
              <Frame
                title={variant.name}
                args={frameArgs(variant, controls)}
                theme={controls.theme}
                device={device}
                width={column}
                index={i}
              />
              <p className="text-text-tertiary typo-footnote">{variant.idea}</p>
            </div>
          ))}
        </div>
      </FrameQueue>
    </Page>
  );
};

export const ReadMePage = (): ReactElement => (
  <Page>
    <Eyebrow>Why does the cookie card hide the signup buttons?</Eyebrow>
    <h1 className="font-bold typo-mega3">Cookie banner &amp; signup strip</h1>
    <Section title="The problem">
      <Body>
        On logged-out public pages (Explore, sources, profiles, posts) the
        signup strip and the iubenda cookie card both pin to the bottom of the
        window. The card is fixed 24px from the bottom-right corner and 340px
        wide; the strip centers a 1,020px row whose right column is the auth
        buttons. Whenever (window − 1,020) ÷ 2 is under 364px, which is any
        window narrower than about 1,750px, the card covers &quot;Continue with
        GitHub&quot;, the email link and &quot;Log in&quot;. That is every
        laptop.
      </Body>
    </Section>
    <Section title="The test">
      <Body>
        Three layouts of the same strip, each A/B tested against production
        behind one feature flag. Goal: strip signup click-through for visitors
        who get the cookie card, with the consent answer rate held steady.
      </Body>
      <Bullets
        items={VARIANTS.map((v) => (
          <>
            <strong className="text-text-primary">{v.name}:</strong> {v.idea}
          </>
        ))}
      />
    </Section>
    <Section title="What changes, what does not">
      <Bullets
        items={[
          'Changes: only the strip’s layout. One column, centered when there is room and left-aligned beside the cookie card on narrower laptops; Google and GitHub side by side, email and log in on one row; the same height as production, with the headline a step smaller.',
          'Unchanged: every word of copy (geo, social, user and default headlines all pass through as children), the AuthOptions flow and tracking, the laptop-only gate, and the cookie card’s own copy and controls.',
          'Mobile and tablet: the strip is gated to 1,020px and up in production and stays that way, so nothing below it changes. The before/after pages include tablet and phone frames to show it.',
          'Additions: Column layout adds nothing; Every source adds one line ("2,000+ sources in one feed"); Handoff dock adds a two-second "Privacy choices saved" confirmation.',
        ]}
      />
    </Section>
    <Section title="Consent rules every variant keeps">
      <Bullets
        items={[
          'The cookie copy is never cut or hidden; the TCF show-more clamp stays at 4+ lines.',
          'Reject and Accept keep identical weight and size.',
          'Consent is never bundled with signup, and signup never depends on accepting.',
        ]}
      />
    </Section>
    <Section title="How to review">
      <Body>
        &quot;1. Compare&quot; shows production and the three variants side by
        side at one size. Each page under &quot;2. Before and after&quot; shows
        production next to one variant at all eight laptop and desktop sizes,
        plus tablet and phone. &quot;3. Implementation&quot; is the plan an
        agent follows to ship the test behind a flag. {LIVE_NOTE}
      </Body>
    </Section>
  </Page>
);

export const ImplementationPage = (): ReactElement => (
  <Page>
    <Eyebrow>How do we ship it behind a flag?</Eyebrow>
    <h1 className="font-bold typo-title1">Implementation plan</h1>
    <Body>
      The same text as README.md in this folder, which is what an agent reads.
    </Body>
    <pre className="max-w-[56rem] whitespace-pre-wrap rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6 font-mono text-text-secondary typo-callout">
      {readme}
    </pre>
  </Page>
);
