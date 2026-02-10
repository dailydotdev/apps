import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { SkillHubHeader } from '@dailydotdev/shared/src/features/skillHub/components/SkillHubHeader';
import { SkillRankingList } from '@dailydotdev/shared/src/features/skillHub/components/SkillRankingList';
import { SkillGrid } from '@dailydotdev/shared/src/features/skillHub/components/SkillGrid';
import { skillHubMockData } from '@dailydotdev/shared/src/features/skillHub/mocks';
import type { Skill } from '@dailydotdev/shared/src/features/skillHub/types';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Skill Hub'),
  openGraph: { ...defaultOpenGraph },
  description:
    'Explore community-built skills for humans and agents. Discover top-ranked skills, trending workflows, and fresh experiments on daily.dev.',
};

const getRecentSkills = (skills: Skill[], limit: number): Skill[] => {
  return [...skills]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
};

const getTopSkills = (skills: Skill[], limit: number): Skill[] => {
  return [...skills].sort((a, b) => b.upvotes - a.upvotes).slice(0, limit);
};

const SkillsPage = (): ReactElement => {
  const topSkills = getTopSkills(skillHubMockData, 10);
  const trendingSkills = skillHubMockData
    .filter((skill) => skill.trending)
    .slice(0, 9);
  const recentSkills = getRecentSkills(skillHubMockData, 9);

  return (
    <PageWrapperLayout className="flex flex-col gap-8 py-6">
      <SkillHubHeader />
      <SkillRankingList title="Top Skills" skills={topSkills} />
      <SkillGrid title="Trending Skills" skills={trendingSkills} />
      <SkillGrid title="Recently Added" skills={recentSkills} />
    </PageWrapperLayout>
  );
};

const getSkillsPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

SkillsPage.getLayout = getSkillsPageLayout;
SkillsPage.layoutProps = {
  screenCentered: false,
  seo,
};

export default SkillsPage;
