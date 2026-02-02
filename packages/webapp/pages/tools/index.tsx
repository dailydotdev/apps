import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { AiIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BreadCrumbs } from '@dailydotdev/shared/src/components/header/BreadCrumbs';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { getAllTopLevelTools } from '@dailydotdev/shared/src/lib/toolsMockData';
import { ToolCard } from '@dailydotdev/shared/src/components/tools/ToolCard';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  title: getTemplatedTitle('AI Tools Directory'),
  openGraph: { ...defaultOpenGraph },
  description:
    'Explore and discover the best AI tools for developers. Find sentiment analysis, discussions, and community insights for tools like Claude, GPT, Gemini, and more.',
};

const ToolsPage = (): ReactElement => {
  const tools = getAllTopLevelTools();

  return (
    <PageWrapperLayout className="py-6">
      <div className="mb-6 flex justify-between">
        <BreadCrumbs>
          <AiIcon size={IconSize.XSmall} secondary /> Tools
        </BreadCrumbs>
      </div>
      <h1 className="mb-2 typo-title1">AI Tools</h1>
      <p className="mb-6 text-text-secondary typo-body">
        Explore AI tools, see community sentiment, and join discussions.
      </p>
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </PageWrapperLayout>
  );
};

const getToolsPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

ToolsPage.getLayout = getToolsPageLayout;
ToolsPage.layoutProps = {
  screenCentered: false,
  seo,
};

export default ToolsPage;
