import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TopReaderBadgeCompact } from '@dailydotdev/shared/src/components/badges/TopReaderBadgeCompact';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  CoreIcon,
  MedalBadgeIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  DevCardTheme,
  themeToLinearGradient,
} from '@dailydotdev/shared/src/components/profile/devcard';
import type { AwardWithRarity } from '../../../webapp/lib/gameCenter';
import { TrophyGrid } from '../../../webapp/components/game-center/TrophyGrid';

const badges = [
  {
    issuedAt: new Date('2026-06-01'),
    keyword: { value: 'clickhouse', flags: { title: 'ClickHouse' } },
  },
  {
    issuedAt: new Date('2026-05-01'),
    keyword: { value: 'rust', flags: { title: 'Rust' } },
  },
  {
    issuedAt: new Date('2026-04-01'),
    keyword: { value: 'github-actions', flags: { title: 'GitHub Actions' } },
  },
  {
    issuedAt: new Date('2026-03-01'),
    keyword: { value: 'react', flags: { title: 'React' } },
  },
];

const awards: AwardWithRarity[] = [
  { id: 'diamond', name: 'Diamond', image: '', count: 1, value: 5000 },
  { id: 'crown', name: 'Crown', image: '', count: 2, value: 2000 },
  { id: 'medal', name: 'Medal', image: '', count: 4, value: 800 },
  { id: 'rocket', name: 'Rocket', image: '', count: 9, value: 300 },
  { id: 'fire', name: 'Fire', image: '', count: 14, value: 120 },
  { id: 'clap', name: 'Clap', image: '', count: 41, value: 20 },
].map((award) => ({ ...award, imageGlow: null })) as AwardWithRarity[];

const SectionTitle = ({ children }: { children: string }) => (
  <Typography
    tag={TypographyTag.H2}
    type={TypographyType.Body}
    color={TypographyColor.Primary}
    bold
  >
    {children}
  </Typography>
);

const statTile = {
  container: '!flex-row items-center gap-2 !border-0 !p-0',
  label: '!typo-subhead',
};

const Counts = () => (
  <div className="flex items-center gap-5">
    <DataTile
      label="Topics mastered"
      value={badges.length}
      info="Topics you have held a top reader badge in."
      icon={<MedalBadgeIcon size={IconSize.Small} className="text-text-tertiary" />}
      className={statTile}
    />
    <DataTile
      label="Total awards"
      value={87}
      info="Every award you have earned across all award types."
      icon={<CoreIcon size={IconSize.Small} className="text-text-tertiary" />}
      className={statTile}
    />
  </div>
);

const Header = ({ children }: { children?: React.ReactNode }) => (
  <div className="flex flex-col gap-2 laptop:flex-row laptop:items-center laptop:justify-between">
    <SectionTitle>Badges &amp; Trophies</SectionTitle>
    {children}
  </div>
);

const Frame = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <section className="flex flex-col gap-4">
    <Typography
      type={TypographyType.Subhead}
      color={TypographyColor.Tertiary}
      bold
    >
      {label}
    </Typography>
    {children}
  </section>
);

/** Design 1 — split holder: badges rail left, trophy grid right. */
const SplitHolder = () => (
  <Frame label="Design 1 — Split holder">
    <div className="flex flex-col gap-4">
      <Header>
        <Counts />
      </Header>
      <div className="grid gap-px overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-border-subtlest-tertiary laptop:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3 bg-background-default p-4">
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Tertiary}
            bold
          >
            Top reader badges
          </Typography>
          <div className="flex flex-col gap-2">
            {badges.map((badge) => (
              <div
                key={badge.keyword.value}
                className="flex items-center justify-between gap-3 rounded-12 bg-background-subtle p-3"
              >
                <Typography type={TypographyType.Subhead} bold>
                  {badge.keyword.flags.title}
                </Typography>
                <span
                  className="rounded-8 px-2 py-0.5"
                  style={{
                    backgroundImage:
                      themeToLinearGradient[DevCardTheme.Gold],
                  }}
                >
                  <Typography
                    type={TypographyType.Subhead}
                    bold
                    className="whitespace-nowrap text-black"
                  >
                    Top reader
                  </Typography>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 bg-background-default p-4">
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Tertiary}
            bold
          >
            Awards
          </Typography>
          <TrophyGrid awards={awards} />
        </div>
      </div>
    </div>
  </Frame>
);

/** Design 2 — one wall: badges and awards as equal cells in a single grid. */
const UnifiedWall = () => (
  <Frame label="Design 2 — One wall">
    <div className="flex flex-col gap-4">
      <Header>
        <Counts />
      </Header>
      <div className="rounded-16 border border-border-subtlest-tertiary p-4">
        <div className="grid grid-cols-5 gap-x-2 gap-y-3 tablet:grid-cols-8 laptop:grid-cols-12">
          {badges.map((badge) => (
            <div
              key={badge.keyword.value}
              className="flex min-w-0 flex-col items-center gap-0.5 py-2"
            >
              <span
                className="grid size-12 place-items-center rounded-max"
                style={{
                  backgroundImage: themeToLinearGradient[DevCardTheme.Gold],
                }}
              >
                <MedalBadgeIcon
                  size={IconSize.Medium}
                  className="text-black"
                />
              </span>
              <Typography
                type={TypographyType.Subhead}
                bold
                className="w-full truncate text-center"
              >
                {badge.keyword.flags.title}
              </Typography>
              <Typography
                type={TypographyType.Subhead}
                color={TypographyColor.Tertiary}
              >
                Top reader
              </Typography>
            </div>
          ))}
          {awards.map((award) => (
            <div
              key={award.id}
              className="flex min-w-0 flex-col items-center gap-0.5 py-2"
            >
              <span className="grid size-12 place-items-center rounded-max bg-background-subtle">
                <CoreIcon
                  size={IconSize.Medium}
                  className="text-text-tertiary"
                />
              </span>
              <Typography
                type={TypographyType.Subhead}
                bold
                className="w-full truncate text-center"
              >
                {award.name}
              </Typography>
              <Typography
                type={TypographyType.Subhead}
                color={TypographyColor.Tertiary}
              >
                ×{award.count}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Frame>
);

/** Design 3 — one holder, a segmented toggle picks the collection. */
const TabbedCase = () => {
  const [tab, setTab] = useState<'badges' | 'awards'>('badges');
  const tabs = [
    { id: 'badges' as const, label: `Badges (${badges.length})` },
    { id: 'awards' as const, label: `Awards (${awards.length})` },
  ];

  return (
    <Frame label="Design 3 — Tabbed case">
      <div className="flex flex-col gap-4">
        <Header>
          <Counts />
        </Header>
        <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4">
          <div className="flex w-max gap-1 rounded-12 bg-background-subtle p-1">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={
                  tab === item.id
                    ? 'rounded-8 bg-background-default px-3 py-1.5 font-bold text-text-primary typo-subhead'
                    : 'rounded-8 px-3 py-1.5 text-text-tertiary typo-subhead'
                }
              >
                {item.label}
              </button>
            ))}
          </div>
          {tab === 'badges' ? (
            <div className="overflow-x-auto pb-2">
              <div className="flex w-max gap-4">
                {badges.map((badge) => (
                  <div key={badge.keyword.value} className="shrink-0">
                    <TopReaderBadgeCompact
                      issuedAt={badge.issuedAt}
                      keyword={badge.keyword}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <TrophyGrid awards={awards} />
          )}
        </div>
      </div>
    </Frame>
  );
};

const queryClient = new QueryClient();

const meta: Meta = {
  title: 'Pages/Badge & Trophy Designs',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      // react-modal binds to #__next, which Next.js renders but Storybook
      // does not.
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

export const Design1SplitHolder: Story = {
  render: () => (
    <div className="mx-auto w-full max-w-[72rem] p-4">
      <SplitHolder />
    </div>
  ),
};

export const Design2OneWall: Story = {
  render: () => (
    <div className="mx-auto w-full max-w-[72rem] p-4">
      <UnifiedWall />
    </div>
  ),
};

export const Design3TabbedCase: Story = {
  render: () => (
    <div className="mx-auto w-full max-w-[72rem] p-4">
      <TabbedCase />
    </div>
  ),
};

export const CompareAll: Story = {
  render: () => (
    <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-10 p-4">
      <SplitHolder />
      <UnifiedWall />
      <TabbedCase />
    </div>
  ),
};
