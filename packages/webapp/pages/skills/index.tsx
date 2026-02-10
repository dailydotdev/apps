import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import classNames from 'classnames';
import { BaseFeedPage } from '@dailydotdev/shared/src/components/utilities';
import { FeedContainer } from '@dailydotdev/shared/src/components/feeds';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { SearchField } from '@dailydotdev/shared/src/components/fields/SearchField';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  HotIcon,
  PlusIcon,
  SparkleIcon,
  AddUserIcon,
  MedalBadgeIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { SkillCard } from '@dailydotdev/shared/src/features/skillHub/components/SkillCard';
import { skillHubMockData } from '@dailydotdev/shared/src/features/skillHub/mocks';
import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import { getLayout } from '../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import { defaultOpenGraph } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Skill Hub'),
  openGraph: { ...defaultOpenGraph },
  description:
    'Explore community-built skills for humans and agents. Discover top-ranked skills, trending workflows, and fresh experiments on daily.dev.',
};

type TabType = 'featured' | 'trending' | 'new' | 'top';

const tabs: { id: TabType; label: string; icon: ReactElement }[] = [
  {
    id: 'featured',
    label: 'Featured',
    icon: <SparkleIcon size={IconSize.Small} />,
  },
  {
    id: 'trending',
    label: 'Trending',
    icon: <HotIcon size={IconSize.Small} />,
  },
  { id: 'new', label: 'New', icon: <AddUserIcon size={IconSize.Small} /> },
  { id: 'top', label: 'Top', icon: <MedalBadgeIcon size={IconSize.Small} /> },
];

const SkillsPage = (): ReactElement => {
  const [activeTab, setActiveTab] = useState<TabType>('featured');

  const getFilteredSkills = () => {
    switch (activeTab) {
      case 'trending':
        return skillHubMockData.filter((skill) => skill.trending);
      case 'new':
        return [...skillHubMockData].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case 'top':
        return [...skillHubMockData].sort((a, b) => b.upvotes - a.upvotes);
      case 'featured':
      default:
        return skillHubMockData.filter((skill) => skill.trending);
    }
  };

  const skills = getFilteredSkills();

  return (
    <BaseFeedPage className="relative mb-4 flex-col px-4 pt-4 laptop:px-18 laptop:pt-8">
      {/* Gradient background like squads */}
      <div className="from-accent-cabbage-default/20 pointer-events-none absolute inset-0 -z-1 hidden h-[25rem] w-full bg-gradient-to-t to-background-default tablet:flex" />

      {/* Header */}
      <header className="mb-6 flex w-full flex-col gap-4">
        {/* Mobile header */}
        <section className="flex w-full flex-row items-center justify-between laptop:hidden">
          <div className="flex items-center gap-2">
            <SparkleIcon
              size={IconSize.Medium}
              className="text-accent-cabbage-default"
            />
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.Title2}
              bold
            >
              Skill Hub
            </Typography>
          </div>
          <Button
            icon={<PlusIcon />}
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
          >
            Share
          </Button>
        </section>

        {/* Desktop header */}
        <div className="hidden items-start justify-between gap-6 laptop:flex">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-14 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default">
                <SparkleIcon
                  size={IconSize.Medium}
                  className="text-white"
                  secondary
                />
              </span>
              <div>
                <Typography
                  tag={TypographyTag.H1}
                  type={TypographyType.LargeTitle}
                  bold
                >
                  Skill Hub
                </Typography>
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Body}
                  className="text-text-secondary"
                >
                  Discover, share, and discuss skills for humans and agents.
                </Typography>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SearchField
              inputId="skill-hub-search"
              placeholder="Search skills..."
              className="w-64"
            />
            <Button
              icon={<PlusIcon />}
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
            >
              Share a Skill
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex gap-2 overflow-x-auto border-b border-border-subtlest-tertiary pb-3">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              pressed={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={classNames(
                'flex shrink-0 items-center gap-2',
                activeTab === tab.id
                  ? 'bg-surface-float text-text-primary'
                  : 'text-text-tertiary',
              )}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </nav>
      </header>

      {/* Skills grid using FeedContainer */}
      <FeedContainer>
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </FeedContainer>
    </BaseFeedPage>
  );
};

SkillsPage.getLayout = getLayout;
SkillsPage.layoutProps = {
  ...mainFeedLayoutProps,
  customBanner: <CustomAuthBanner />,
  seo,
};

export default SkillsPage;
