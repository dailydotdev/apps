import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentExploreEntry } from '@dailydotdev/shared/src/features/interests/components/AgentExploreEntry';
import { SpotlightContext } from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import { pageHeaderClassName } from '@dailydotdev/shared/src/components/layout/PageHeader';

/**
 * /dev/agent-entry — the Explore entry, in the strip it lives in.
 *
 * The real mount is `MainLayoutHeader` on the Explore feed, where it takes the
 * place of the search field — and that needs boot, the flag and a signed-in
 * user. This stands the control up over a stub of the sorts below it.
 *
 * Phone widths only, as in the app: from tablet up the control stands aside for
 * the field docked over the feed, so this page is empty above 656px on purpose.
 * Carries `noindex`/`nofollow`.
 */
const Page = (): ReactElement => (
  <AgentDemoProviders>
    <NextSeo title="Agent entry point" noindex nofollow />
    <SpotlightContext.Provider
      value={{ open: () => undefined } as never}
      // eslint-disable-next-line react/jsx-no-constructed-context-values
    >
      <div className="min-h-[100dvh] bg-background-default">
        {/* The slot it lives in: the header's own search wrapper, which is what
            it replaces on mobile Explore. */}
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

export default Page;
