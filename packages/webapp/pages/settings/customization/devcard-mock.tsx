import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import type { NextSeoProps } from 'next-seo';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { DevCardIcon } from '@dailydotdev/shared/src/components/icons/DevCard';
import { MedalBadgeIcon } from '@dailydotdev/shared/src/components/icons/MedalBadge';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons/ReadingStreak';
import { ReputationIcon } from '@dailydotdev/shared/src/components/icons/Reputation';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { SparkleIcon } from '@dailydotdev/shared/src/components/icons/Sparkle';
import { BriefIcon } from '@dailydotdev/shared/src/components/icons/Brief';
import { HotIcon } from '@dailydotdev/shared/src/components/icons/Hot';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { cloudinaryDevcardDefaultCoverImage } from '@dailydotdev/shared/src/lib/image';
import { getPageSeoTitles } from '../../../components/layouts/utils';

type MockLayout = 'profile' | 'proof' | 'stack';
type MockTheme = 'signal' | 'graphite' | 'ranked';
type MockOption = 'achievements' | 'stack' | 'gear' | 'hotTake';

const mockOptions: { id: MockOption; label: string }[] = [
  { id: 'achievements', label: 'Achievements' },
  { id: 'stack', label: 'Stack' },
  { id: 'gear', label: 'Gear' },
  { id: 'hotTake', label: 'Hot take' },
];

const layouts: { id: MockLayout; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'proof', label: 'Proof' },
  { id: 'stack', label: 'Stack' },
];

const themes: Record<
  MockTheme,
  {
    label: string;
    background: string;
    accent: string;
    accentSoft: string;
    ring: string;
  }
> = {
  signal: {
    label: 'Signal',
    background:
      'linear-gradient(145deg, #10141f 0%, #17251d 44%, #2b2113 100%)',
    accent: 'bg-accent-avocado-default',
    accentSoft: 'bg-accent-avocado-default/16 text-accent-avocado-default',
    ring: 'ring-accent-avocado-default/30',
  },
  graphite: {
    label: 'Graphite',
    background:
      'linear-gradient(145deg, #f6f7fb 0%, #e9eef5 48%, #d6efe9 100%)',
    accent: 'bg-accent-water-default',
    accentSoft: 'bg-accent-water-default/16 text-accent-water-default',
    ring: 'ring-accent-water-default/30',
  },
  ranked: {
    label: 'Ranked',
    background:
      'linear-gradient(145deg, #1d1217 0%, #242033 44%, #3a2f14 100%)',
    accent: 'bg-accent-cheese-default',
    accentSoft: 'bg-accent-cheese-default/16 text-accent-cheese-default',
    ring: 'ring-accent-cheese-default/30',
  },
};

const stats = [
  { label: 'Reputation', value: '18.4k', icon: ReputationIcon },
  { label: 'Read', value: '1,286', icon: BriefIcon },
  { label: 'Streak', value: '164d', icon: ReadingStreakIcon },
];

const achievements = [
  { title: 'AI Pathfinder', meta: 'Top 2%', color: 'bg-accent-onion-default' },
  { title: 'Open Source Sage', meta: 'Rare', color: 'bg-accent-water-default' },
  { title: 'Brief Boss', meta: 'Level 8', color: 'bg-accent-cheese-default' },
];

const stack = ['Next.js', 'React', 'GraphQL', 'TanStack Query', 'Postgres'];
const gear = ['MacBook Pro', 'Raycast', 'Zed', 'Arc'];

const profile = {
  name: 'Ada Lovelace',
  username: 'ada',
  title: 'Full-stack engineer building calm AI tools',
  location: 'London, UK',
  avatar: fallbackImages.avatar,
  cover: cloudinaryDevcardDefaultCoverImage,
  hotTake: 'The best developer tools feel invisible until they save your day.',
};

const seoTitles = getPageSeoTitles('DevCard mock');
const seo: NextSeoProps = {
  title: seoTitles.title,
  noindex: true,
  nofollow: true,
};

const SectionTitle = ({ children }: { children: ReactNode }): ReactElement => (
  <h2 className="font-bold text-text-primary typo-title3">{children}</h2>
);

const OptionButton = ({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    className={classNames(
      'rounded-12 border px-4 py-2 text-left font-bold transition-colors typo-callout',
      active
        ? 'bg-accent-cabbage-default/16 border-accent-cabbage-default text-text-primary'
        : 'border-border-subtlest-tertiary bg-surface-float text-text-tertiary hover:text-text-primary',
    )}
    onClick={onClick}
  >
    {children}
  </button>
);

const StatTile = ({
  label,
  value,
  icon: Icon,
}: (typeof stats)[number]): ReactElement => (
  <div className="bg-black/20 flex min-w-0 flex-1 items-center gap-2 rounded-14 px-3 py-2 text-white backdrop-blur">
    <Icon className="text-white/72 shrink-0" size={IconSize.XSmall} />
    <div className="min-w-0">
      <p className="typo-title4 font-bold">{value}</p>
      <p className="truncate text-white/64 typo-caption1">{label}</p>
    </div>
  </div>
);

const ProfileHeader = ({ theme }: { theme: MockTheme }): ReactElement => (
  <div className="relative">
    <img
      src={profile.cover}
      alt=""
      className="opacity-80 h-24 w-full rounded-20 object-cover"
    />
    <div className="from-black/60 absolute inset-0 rounded-20 bg-gradient-to-t to-transparent" />
    <img
      src={profile.avatar}
      alt={`${profile.name} avatar`}
      className={classNames(
        'absolute -bottom-8 left-4 size-20 rounded-24 border-4 border-white object-cover ring-8',
        themes[theme].ring,
      )}
    />
    <div
      className={classNames(
        'absolute bottom-3 right-3 rounded-10 px-2.5 py-1 font-bold text-black typo-caption1',
        themes[theme].accent,
      )}
    >
      Legendary
    </div>
  </div>
);

const AchievementStrip = (): ReactElement => (
  <div className="grid grid-cols-3 gap-2">
    {achievements.map((item) => (
      <div
        key={item.title}
        className="border-white/10 min-w-0 rounded-14 border bg-white/[0.06] p-2"
      >
        <span
          className={classNames(
            'mb-2 flex size-7 items-center justify-center rounded-10 text-black',
            item.color,
          )}
        >
          <MedalBadgeIcon size={IconSize.XXSmall} />
        </span>
        <p className="truncate font-bold text-white typo-caption1">
          {item.title}
        </p>
        <p className="text-white/56 typo-caption1">{item.meta}</p>
      </div>
    ))}
  </div>
);

const ChipList = ({
  items,
  icon,
}: {
  items: string[];
  icon?: ReactElement;
}): ReactElement => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => (
      <span
        key={item}
        className="flex min-w-0 items-center gap-1 rounded-10 bg-white/[0.08] px-2.5 py-1 text-white typo-caption1"
      >
        {icon}
        {item}
      </span>
    ))}
  </div>
);

const DynamicModules = ({
  selectedOptions,
}: {
  selectedOptions: MockOption[];
}): ReactElement => (
  <div className="flex flex-col gap-3">
    {selectedOptions.includes('achievements') && <AchievementStrip />}
    {selectedOptions.includes('stack') && (
      <ChipList
        items={stack}
        icon={
          <SparkleIcon
            className="text-accent-cabbage-default"
            size={IconSize.XXSmall}
          />
        }
      />
    )}
    {selectedOptions.includes('gear') && (
      <ChipList
        items={gear}
        icon={
          <SettingsIcon
            className="text-accent-water-default"
            size={IconSize.XXSmall}
          />
        }
      />
    )}
    {selectedOptions.includes('hotTake') && (
      <div className="border-white/10 rounded-16 border bg-white/[0.07] p-3">
        <div className="mb-2 flex items-center gap-2 text-accent-cheese-default typo-caption1">
          <HotIcon size={IconSize.XXSmall} />
          Hot take
        </div>
        <p className="text-white typo-callout">{profile.hotTake}</p>
      </div>
    )}
  </div>
);

const DevCardMockPreview = ({
  layout,
  theme,
  selectedOptions,
}: {
  layout: MockLayout;
  theme: MockTheme;
  selectedOptions: MockOption[];
}): ReactElement => {
  const isGraphite = theme === 'graphite';
  const cardTextClass = isGraphite ? 'text-raw-pepper-90' : 'text-white';

  if (layout === 'proof') {
    return (
      <div
        className={classNames(
          'shadow-2xl grid w-full max-w-[48rem] gap-5 rounded-32 p-5 ring-1 ring-white/16 tablet:grid-cols-[1fr_17rem]',
          cardTextClass,
        )}
        style={{ background: themes[theme].background }}
      >
        <div className="flex min-w-0 flex-col justify-between gap-8">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <img
                src={profile.avatar}
                alt={`${profile.name} avatar`}
                className="size-16 rounded-20 border-4 border-white object-cover"
              />
              <div className="min-w-0">
                <h3 className="truncate font-bold typo-title1">
                  {profile.name}
                </h3>
                <p className="opacity-72 truncate typo-callout">
                  @{profile.username} · {profile.location}
                </p>
              </div>
            </div>
            <p className="max-w-xl font-bold typo-title2">{profile.title}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <StatTile key={stat.label} {...stat} />
            ))}
          </div>
        </div>
        <DynamicModules selectedOptions={selectedOptions} />
      </div>
    );
  }

  if (layout === 'stack') {
    return (
      <div
        className={classNames(
          'shadow-2xl w-full max-w-[34rem] rounded-32 p-4 ring-1 ring-white/16',
          cardTextClass,
        )}
        style={{ background: themes[theme].background }}
      >
        <div className="bg-black/20 flex items-center gap-3 rounded-24 p-3">
          <img
            src={profile.avatar}
            alt={`${profile.name} avatar`}
            className="size-16 rounded-20 border-4 border-white object-cover"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-bold typo-title2">{profile.name}</h3>
            <p className="opacity-72 truncate typo-callout">
              @{profile.username}
            </p>
          </div>
          <DevCardIcon size={IconSize.Large} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {stack.map((item, index) => (
            <div
              key={item}
              className="border-white/10 flex min-h-16 items-center justify-between rounded-16 border bg-white/[0.07] px-3"
            >
              <span className="font-bold typo-callout">{item}</span>
              <span
                className={classNames(
                  'flex size-7 items-center justify-center rounded-10 text-black typo-caption1',
                  index % 2 === 0
                    ? 'bg-accent-cabbage-default'
                    : 'bg-accent-water-default',
                )}
              >
                {index + 1}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <DynamicModules selectedOptions={selectedOptions} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'shadow-2xl w-full max-w-[22rem] rounded-32 p-3 ring-1 ring-white/16',
        cardTextClass,
      )}
      style={{ background: themes[theme].background }}
    >
      <ProfileHeader theme={theme} />
      <div className="px-1 pb-2 pt-10">
        <div className="mb-4 min-w-0">
          <h3 className="truncate font-bold typo-title1">{profile.name}</h3>
          <p className="opacity-72 truncate typo-callout">
            @{profile.username} · {profile.location}
          </p>
          <p className="mt-3 line-clamp-2 typo-callout">{profile.title}</p>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <StatTile key={stat.label} {...stat} />
          ))}
        </div>
        <DynamicModules selectedOptions={selectedOptions} />
      </div>
    </div>
  );
};

const Page = (): ReactElement => {
  const [layout, setLayout] = useState<MockLayout>('profile');
  const [theme, setTheme] = useState<MockTheme>('signal');
  const [selectedOptions, setSelectedOptions] = useState<MockOption[]>([
    'achievements',
    'stack',
    'hotTake',
  ]);

  const selectedOptionLabels = useMemo(
    () =>
      mockOptions
        .filter((option) => selectedOptions.includes(option.id))
        .map((option) => option.label)
        .join(', '),
    [selectedOptions],
  );

  const toggleOption = (option: MockOption) => {
    setSelectedOptions((current) => {
      if (current.includes(option)) {
        return current.filter((item) => item !== option);
      }

      return [...current, option];
    });
  };

  return (
    <main className="min-h-screen bg-background-default px-4 py-6 tablet:px-8 laptop:px-12">
      <div className="mx-auto flex w-full max-w-[76rem] flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-border-subtlest-tertiary pb-6 laptop:flex-row laptop:items-end laptop:justify-between">
          <div className="max-w-[44rem]">
            <div className="mb-3 flex items-center gap-2 text-accent-cabbage-default typo-callout">
              <DevCardIcon size={IconSize.XSmall} />
              DevCard 2026 mock
            </div>
            <h1 className="font-bold text-text-primary typo-mega2">
              Dynamic profile cards
            </h1>
            <p className="mt-3 text-text-tertiary typo-body">
              A live concept for a richer DevCard built around reputation,
              achievements, stack, gear, and opinionated profile moments.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<ShareIcon />}
            >
              Share
            </Button>
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              icon={<DevCardIcon />}
            >
              Generate
            </Button>
          </div>
        </header>

        <div className="grid gap-6 laptop:grid-cols-[20rem_1fr]">
          <aside className="flex flex-col gap-5 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-5">
            <section className="flex flex-col gap-3">
              <SectionTitle>Format</SectionTitle>
              <div className="grid grid-cols-3 gap-2 laptop:grid-cols-1">
                {layouts.map((item) => (
                  <OptionButton
                    key={item.id}
                    active={layout === item.id}
                    onClick={() => setLayout(item.id)}
                  >
                    {item.label}
                  </OptionButton>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <SectionTitle>Theme</SectionTitle>
              <div className="grid grid-cols-3 gap-2 laptop:grid-cols-1">
                {Object.entries(themes).map(([id, item]) => (
                  <button
                    key={id}
                    type="button"
                    className={classNames(
                      'flex items-center gap-3 rounded-12 border p-2 text-left transition-colors',
                      theme === id
                        ? 'border-accent-cabbage-default'
                        : 'border-border-subtlest-tertiary',
                    )}
                    onClick={() => setTheme(id as MockTheme)}
                  >
                    <span
                      className="size-8 shrink-0 rounded-10"
                      style={{ background: item.background }}
                    />
                    <span className="min-w-0 truncate font-bold text-text-primary typo-callout">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <SectionTitle>Signals</SectionTitle>
              <div className="flex flex-col gap-2">
                {mockOptions.map((option) => (
                  <label
                    key={option.id}
                    htmlFor={`devcard-mock-${option.id}`}
                    className="flex cursor-pointer items-center justify-between rounded-12 border border-border-subtlest-tertiary px-3 py-2 text-text-primary typo-callout"
                  >
                    {option.label}
                    <input
                      id={`devcard-mock-${option.id}`}
                      type="checkbox"
                      className="size-4 accent-accent-cabbage-default"
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => toggleOption(option.id)}
                    />
                  </label>
                ))}
              </div>
            </section>
          </aside>

          <section className="flex min-h-[42rem] flex-col gap-5 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-4 tablet:p-6">
            <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between">
              <div>
                <SectionTitle>{themes[theme].label} preview</SectionTitle>
                <p className="mt-1 text-text-tertiary typo-callout">
                  {layouts.find((item) => item.id === layout)?.label} ·{' '}
                  {selectedOptionLabels || 'Core identity'}
                </p>
              </div>
              <span
                className={classNames(
                  'w-fit rounded-10 px-3 py-1 font-bold typo-caption1',
                  themes[theme].accentSoft,
                )}
              >
                Live mock
              </span>
            </div>

            <div className="flex flex-1 items-center justify-center rounded-24 border border-border-subtlest-tertiary bg-background-default p-4 tablet:p-8">
              <DevCardMockPreview
                layout={layout}
                theme={theme}
                selectedOptions={selectedOptions}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

Page.layoutProps = { seo };

export default Page;
