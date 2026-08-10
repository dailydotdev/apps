import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentExploreEntry } from '@dailydotdev/shared/src/features/interests/components/AgentExploreEntry';
import { SpotlightContext } from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import { pageHeaderClassName } from '@dailydotdev/shared/src/components/layout/PageHeader';

// Stands the Explore entry up without boot, the flag or a user. Empty above
// 656px on purpose: from tablet up the docked field takes over.
const Page = (): ReactElement => (
  <AgentDemoProviders>
    <NextSeo title="Agent entry point" noindex nofollow />
    <SpotlightContext.Provider
      value={{ open: () => undefined } as never}
      // eslint-disable-next-line react/jsx-no-constructed-context-values
    >
      <div className="min-h-[100dvh] bg-background-default">
        <div className="mx-2 items-center py-3">
          <AgentExploreEntry />
        </div>
        <header className={`${pageHeaderClassName} !py-0`}>
          <span className="text-text-tertiary typo-callout">
            Popular · By upvotes · By comments · By date
          </span>
        </header>
      </div>
    </SpotlightContext.Provider>
  </AgentDemoProviders>
);

export { devPageServerSideProps as getServerSideProps } from '../../lib/devPage';

export default Page;
