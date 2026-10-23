import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ShellProps } from './shell';
import { Marker, V2Shell } from './shell';

// Fixes for the four clear losses in the layout_v2_reboot feature exploration
// read (new laptop sign-ups, 1,499 control vs 1,468 v2, 10-07 to 10-12).

const meta: Meta<typeof V2Shell> = {
  title: 'Experiments/Layout V2 Fixes',
  component: V2Shell,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['current', 'proposed'] },
    panel: { control: 'inline-radio', options: ['explore', 'you', 'none'] },
    isPlus: { control: 'boolean' },
    height: { control: { type: 'range', min: 560, max: 1000, step: 20 } },
    showMarkers: { control: 'boolean' },
  },
  args: {
    variant: 'proposed',
    panel: 'explore',
    isPlus: false,
    height: 820,
    width: 1280,
    showMarkers: true,
  },
};

export default meta;

type Story = StoryObj<typeof V2Shell>;

interface Change {
  n: number;
  title: string;
  metric: string;
  control: string;
  v2: string;
  delta: string;
  why: string;
  change: string;
}

const CHANGES: Change[] = [
  {
    n: 1,
    title: 'New post: under Search, and in the page header',
    metric: 'Created a post',
    control: '1.8%',
    v2: '0.7%',
    delta: '−58%',
    why: 'v1 opened the sidebar with a full-width, labeled "New post" button. v2 has a bare 36px icon chip after the avatar, the last item in the tab list. It is always visible, but nothing names it, and its position moves with the user\'s tab order.',
    change:
      'The rail chip stays exactly as it is, but moves to just below Search, in the fixed top block. It is outside the reorderable list, so it never moves or folds, and the rail folds at the same heights. A second, labeled "New post" button sits at the right end of the page header, where v1\'s header kept it.',
  },
  {
    n: 2,
    title: 'Plus: a card at the foot of the sidebar panel',
    metric: 'Visited Plus',
    control: '6.5%',
    v2: '0.9%',
    delta: '−86%',
    why: 'v1 had a "Get Plus" button in the header and a row in the sidebar. In v2 the only entry is the first row of the "You" panel, which only shows after you hover or click the avatar. This is the first step of the upgrade funnel.',
    change:
      'A daily.dev Plus card (the same tile and perks as the Plus hover preview) pinned to the bottom of every sidebar panel, including Explore, the panel the home feed opens. It replaces the "Get Plus" row at the top of the "You" panel. Non-members only. The panel is collapsed by default, so the card is seen on hover or once the panel is pinned open. Options that show Get Plus by default are in Experiments/Layout V2 Get Plus.',
  },
  {
    n: 3,
    title: 'Following: second chip on the home feed',
    metric: 'Visited Following',
    control: '5.0%',
    v2: '0.7%',
    delta: '−85%',
    why: 'The Following feed still exists (it was removed 10-12 and brought back 10-13 in #6879). On desktop v2 it sits only in the "You" panel. The mobile shell already lists it among the home segments.',
    change:
      'Following is the second chip, right after "For you" and ahead of custom feeds, in the home chip bar. The "You" panel row stays.',
  },
  {
    n: 4,
    title: 'Marketplace: higher in the Explore panel',
    metric: 'Visited Marketplace',
    control: '5.1%',
    v2: '1.8%',
    delta: '−66%',
    why: 'In v1, Marketplace was a row in the always-open sidebar. In v2 it is already in the Explore panel, since 10-08 (#6831), but fifth, after Tags and Sources, and the panel only opens on hover. The drop held after the move.',
    change:
      'Marketplace moves to the top group of the Explore panel, right under Explore and Happening Now, with a "New" hint while the sidebar-click action is not completed.',
  },
];

const LEFT_ALONE = [
  [
    'History',
    '4.1% → 0.7%',
    'Stays in the "You" panel; low-intent, not worth rail space.',
  ],
  ['Search', '3.9% → 2.7%', 'Noise-level. Still on the rail and on ⌘K.'],
  ['Tags index', '1.3% → 0.5%', 'Tiny counts (20 vs 7 users).'],
  [
    'Highlights',
    '5.1% → 3.4%',
    'Small drop; Happening Now is the second Explore row.',
  ],
];

const KEEP = [
  'Custom feeds +45% (created +95%): the chip bar is the reason, so the change adds to it and keeps custom feeds right after Following.',
  'Explore Posts hub +88%: Explore stays the first tab and first panel row.',
  'Quest claims +60%: the Streak tab is not touched.',
];

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3">
    <h2 className="font-bold text-text-primary typo-title3">{title}</h2>
    {children}
  </section>
);

const ChangeCard = ({ change }: { change: Change }): ReactElement => (
  <div className="flex gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
    <span className="relative size-5 shrink-0">
      <Marker n={change.n} className="left-0 top-0.5" />
    </span>
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-bold text-text-primary typo-body">
          {change.title}
        </h3>
        <span className="text-text-tertiary typo-footnote">
          {change.metric}: {change.control} →{' '}
          <span className="font-bold text-accent-ketchup-default">
            {change.v2} ({change.delta})
          </span>
        </span>
      </div>
      <p className="text-text-secondary typo-callout">
        <strong className="text-text-primary">Why: </strong>
        {change.why}
      </p>
      <p className="text-text-secondary typo-callout">
        <strong className="text-text-primary">Change: </strong>
        {change.change}
      </p>
    </div>
  </div>
);

const Legend = ({ className }: { className?: string }): ReactElement => (
  <ol className={classNames('flex flex-col gap-3', className)}>
    {CHANGES.map((change) => (
      <li key={change.n} className="flex gap-3">
        <span className="relative size-5 shrink-0">
          <Marker n={change.n} className="left-0 top-0" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold text-text-primary typo-callout">
            {change.title}
          </span>
          <span className="text-text-tertiary typo-footnote">
            {change.metric} {change.control} → {change.v2} ({change.delta})
          </span>
        </div>
      </li>
    ))}
  </ol>
);

const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="min-h-screen bg-background-default p-8 text-text-primary">
    {children}
  </div>
);

const Caption = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="mb-3 font-bold uppercase tracking-wider text-text-tertiary typo-caption1">
    {children}
  </div>
);

export const ReadMeFirst: Story = {
  name: 'Read me first',
  render: () => (
    <Page>
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="font-bold typo-title1">Layout v2: four fixes</h1>
          <p className="text-text-secondary typo-body">
            Early read of <code>layout_v2_reboot</code> (Agent Smith, BigQuery,
            new laptop sign-ups 10-07 to 10-12, 1,499 control vs 1,468 v2). v2
            sends people to what the rail shows directly and loses what it
            hides. Of the clear losses, four are worth winning back. They are
            all placement problems, so each fix is a placement change.
          </p>
        </header>
        <Section title="What changes">
          {CHANGES.map((change) => (
            <ChangeCard key={change.n} change={change} />
          ))}
        </Section>
        <Section title="What stays as it is">
          <div className="overflow-hidden rounded-16 border border-border-subtlest-tertiary">
            {LEFT_ALONE.map(([name, read, note]) => (
              <div
                key={name}
                className="grid grid-cols-[8rem_8rem_1fr] gap-4 border-b border-border-subtlest-tertiary px-4 py-3 typo-callout last:border-b-0"
              >
                <span className="font-bold">{name}</span>
                <span className="text-text-tertiary">{read}</span>
                <span className="text-text-secondary">{note}</span>
              </div>
            ))}
          </div>
        </Section>
        <Section title="What must not regress">
          <ul className="flex list-disc flex-col gap-1 pl-5 text-text-secondary typo-callout">
            {KEEP.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Section>
        <p className="text-text-tertiary typo-footnote">
          Five days of data, not a GrowthBook result. The shell in these stories
          is drawn at production sizes (rail <code>w-20</code>, panel{' '}
          <code>w-60</code>); only the four marked spots differ between Current
          and Proposed.
        </p>
      </div>
    </Page>
  ),
};

export const Proposed: Story = {
  render: (args) => (
    <Page>
      <div className="flex items-start gap-8">
        <V2Shell {...args} />
        <Legend className="w-64 shrink-0 pt-2" />
      </div>
    </Page>
  ),
};

export const Current: Story = {
  args: { variant: 'current' },
  render: (args) => (
    <Page>
      <V2Shell {...args} />
    </Page>
  ),
};

const SideBySide = (props: Omit<ShellProps, 'variant'>): ReactElement => (
  <div className="flex flex-col gap-10">
    {(['current', 'proposed'] as const).map((variant) => (
      <div key={variant}>
        <Caption>{variant === 'current' ? 'Current v2' : 'Proposed'}</Caption>
        <div className="flex items-start gap-8">
          <V2Shell {...props} variant={variant} />
          {variant === 'proposed' && <Legend className="w-64 shrink-0" />}
        </div>
      </div>
    ))}
  </div>
);

export const Compare: Story = {
  name: 'Compare: Explore panel',
  render: ({ variant: _, ...args }) => (
    <Page>
      <SideBySide {...args} />
    </Page>
  ),
};

export const CompareYouPanel: Story = {
  name: 'Compare: You panel',
  args: { panel: 'you' },
  render: ({ variant: _, ...args }) => (
    <Page>
      <SideBySide {...args} />
    </Page>
  ),
};

// On a short laptop the rail folds its lowest tabs into "More". Proposed moves
// the same New post chip out of the folding region and puts Plus in the panel,
// so the same tabs fold at the same heights in both.
export const ShortViewport: Story = {
  name: 'Short viewport (fold check)',
  args: { height: 640, panel: 'none' },
  render: ({ variant: _, ...args }) => (
    <Page>
      <SideBySide {...args} />
    </Page>
  ),
};

export const PlusMember: Story = {
  name: 'Plus member',
  args: { isPlus: true, panel: 'you' },
  render: (args) => (
    <Page>
      <Caption>Members get no Plus card and no panel row</Caption>
      <V2Shell {...args} />
    </Page>
  ),
};
