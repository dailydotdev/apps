import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';

/* ── shared bits ────────────────────────────────────────────────────── */

const LEVEL = 14;
const PROGRESS = 70;
const XP_IN = 1400;
const XP_TARGET = 2000;

const STATS = [
  { label: 'Streak', value: '12d' },
  { label: 'Longest', value: '28d' },
  { label: 'Badges', value: '9/24' },
  { label: 'Total XP', value: '3,420' },
];

// Same treatment the shipped panel uses: off-token purples, so they live in a
// style object rather than arbitrary classes the no-custom-color rule rejects.
const panelStyle = {
  backgroundColor: '#2A0B3D',
  backgroundImage: [
    'radial-gradient(circle at 14% 22%, rgba(230,105,251,0.32), transparent 58%)',
    'radial-gradient(circle at 94% 86%, rgba(122,63,255,0.30), transparent 62%)',
    'repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 14px)',
    'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)',
  ].join(', '),
  backgroundSize: 'auto, auto, auto, 16px 16px',
};

const glassStyle = {
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.42), rgba(255,255,255,0.10))',
  border: '1px solid rgba(255,255,255,0.45)',
};

const glassTileStyle = {
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05))',
  border: '1px solid rgba(255,255,255,0.18)',
};

const LevelBadge = ({ size = 'size-18' }: { size?: string }) => (
  <div
    className={`flex ${size} shrink-0 items-center justify-center rounded-16 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(255,255,255,0.12),0_8px_24px_-8px_rgba(0,0,0,0.65)] backdrop-blur-[6px]`}
    style={glassStyle}
    aria-label={`Level ${LEVEL}`}
  >
    <Typography
      type={TypographyType.Mega2}
      className="tabular-nums !font-black !leading-none"
    >
      {LEVEL}
    </Typography>
  </div>
);

const Bar = () => (
  <ProgressBar
    percentage={PROGRESS}
    shouldShowBg
    className={{
      wrapper: 'h-2 rounded-max !bg-[#5A1E75]',
      bar: 'h-full rounded-max',
      barColor: 'bg-[#E669FB]',
    }}
  />
);

const XpReadout = () => (
  <Typography type={TypographyType.Callout} bold className="text-white">
    {XP_IN.toLocaleString()} / {XP_TARGET.toLocaleString()}
  </Typography>
);

const GlassStat = ({ label, value }: { label: string; value: string }) => (
  <div
    className="flex flex-col gap-0.5 rounded-14 px-4 py-3 backdrop-blur-[6px]"
    style={glassTileStyle}
  >
    <Typography type={TypographyType.Subhead} className="text-white opacity-64">
      {label}
    </Typography>
    <Typography type={TypographyType.Title3} bold className="text-white">
      {value}
    </Typography>
  </div>
);

const Frame = ({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col">
    <div className="flex flex-col gap-0.5 px-4 pb-3">
      <Typography type={TypographyType.Subhead} bold>
        {label}
      </Typography>
      <Typography
        type={TypographyType.Subhead}
        color={TypographyColor.Tertiary}
      >
        {note}
      </Typography>
    </div>
    {children}
    {/* what the page would show underneath */}
    <div className="px-4 pt-6">
      <Typography tag={TypographyTag.H2} type={TypographyType.Body} bold>
        Milestone quests
      </Typography>
    </div>
  </section>
);

/* ── Hero 1 — Wide banner ───────────────────────────────────────────── */

const WideBanner = () => (
  <Frame
    label="Hero 1 — Wide banner"
    note="Panel goes edge to edge, flush to the top. Progress left, stats right on glass."
  >
    <div
      className="flex flex-col gap-6 px-4 py-6 laptop:flex-row laptop:items-center laptop:gap-10 laptop:px-8"
      style={panelStyle}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center gap-4">
          <LevelBadge />
          <div className="flex min-w-0 flex-col">
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.Title2}
              bold
              className="truncate text-white"
            >
              Tomer, here&apos;s how you&apos;re doing.
            </Typography>
            <Typography
              type={TypographyType.Subhead}
              className="text-white opacity-64"
            >
              600 XP to level {LEVEL + 1}
            </Typography>
          </div>
        </div>
        <Bar />
        <XpReadout />
      </div>
      <div className="grid grid-cols-2 gap-2 laptop:w-[28rem] laptop:shrink-0 laptop:grid-cols-4">
        {STATS.map((stat) => (
          <GlassStat key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  </Frame>
);

/* ── Hero 2 — Stacked hero ──────────────────────────────────────────── */

const StackedHero = () => (
  <Frame
    label="Hero 2 — Stacked hero"
    note="Greeting sits inside the panel. Bar spans the full width, stats form a strip along the bottom edge."
  >
    <div style={panelStyle}>
      <div className="flex flex-col gap-4 px-4 pt-8 laptop:px-8">
        <div className="flex items-end gap-4">
          <LevelBadge size="size-22" />
          <div className="flex min-w-0 flex-col pb-1">
            <Typography
              type={TypographyType.Subhead}
              className="text-white opacity-64"
            >
              Level {LEVEL}
            </Typography>
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.LargeTitle}
              bold
              className="truncate text-white"
            >
              Tomer, here&apos;s how you&apos;re doing.
            </Typography>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Bar />
          <div className="flex items-baseline justify-between gap-3">
            <XpReadout />
            <Typography
              type={TypographyType.Subhead}
              className="text-white opacity-64"
            >
              600 XP to level {LEVEL + 1}
            </Typography>
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-px bg-white/10 tablet:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-0.5 px-4 py-3 backdrop-blur-[6px] laptop:px-8"
            style={glassTileStyle}
          >
            <Typography
              type={TypographyType.Subhead}
              className="text-white opacity-64"
            >
              {stat.label}
            </Typography>
            <Typography type={TypographyType.Title3} bold className="text-white">
              {stat.value}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  </Frame>
);

/* ── Hero 3 — HUD bar ───────────────────────────────────────────────── */

const HudBar = () => (
  <Frame
    label="Hero 3 — HUD bar"
    note="One dense row, like a game HUD. Shortest of the three, so the feed starts higher."
  >
    <div
      className="flex flex-col gap-4 px-4 py-4 laptop:flex-row laptop:items-center laptop:gap-6 laptop:px-8"
      style={panelStyle}
    >
      <div className="flex items-center gap-3">
        <LevelBadge size="size-14" />
        <div className="flex flex-col">
          <Typography type={TypographyType.Callout} bold className="text-white">
            Tomer
          </Typography>
          <Typography
            type={TypographyType.Subhead}
            className="text-white opacity-64"
          >
            Level {LEVEL}
          </Typography>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Bar />
        <div className="flex items-baseline justify-between gap-3">
          <Typography
            type={TypographyType.Subhead}
            bold
            className="text-white tabular-nums"
          >
            {XP_IN.toLocaleString()} / {XP_TARGET.toLocaleString()}
          </Typography>
          <Typography
            type={TypographyType.Subhead}
            className="text-white opacity-64"
          >
            600 XP to level {LEVEL + 1}
          </Typography>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-1.5">
            <Typography
              type={TypographyType.Subhead}
              className="text-white opacity-64"
            >
              {stat.label}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              bold
              className="text-white"
            >
              {stat.value}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  </Frame>
);

/* ── stories ────────────────────────────────────────────────────────── */

const queryClient = new QueryClient();

const meta: Meta = {
  title: 'Pages/Progress Hero Designs',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div id="__next">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const Hero1WideBanner: Story = { render: () => <WideBanner /> };
export const Hero2StackedHero: Story = { render: () => <StackedHero /> };
export const Hero3HudBar: Story = { render: () => <HudBar /> };

export const CompareAll: Story = {
  render: () => (
    <div className="flex flex-col gap-12 pb-10">
      <WideBanner />
      <StackedHero />
      <HudBar />
    </div>
  ),
};
