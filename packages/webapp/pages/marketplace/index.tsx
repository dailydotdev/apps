import type { ReactElement } from 'react';
import React, { Fragment, useState } from 'react';
import type { GetStaticPropsResult } from 'next';
import Head from 'next/head';
import type { NextSeoProps } from 'next-seo/lib/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { ShellActions } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { OpenLinkIcon } from '@dailydotdev/shared/src/components/icons/OpenLink';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { SearchField } from '@dailydotdev/shared/src/components/fields/SearchField';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type {
  Plugin,
  PluginsData,
} from '@dailydotdev/shared/src/graphql/plugins';
import {
  marketplaceSubmissionsUrl,
  marketplaceSubmitUrl,
  PLUGINS_QUERY,
  pluginsQueryOptions,
} from '@dailydotdev/shared/src/graphql/plugins';
import useDebounce from '@dailydotdev/shared/src/hooks/useDebounce';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useTrackQuestClientEvent } from '@dailydotdev/shared/src/hooks/useTrackQuestClientEvent';
import { ClientQuestEventType } from '@dailydotdev/shared/src/graphql/quests';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import {
  mcpServerDocs,
  pluginMarketplaceDocs,
} from '@dailydotdev/shared/src/lib/constants';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { PluginCard } from '../../components/marketplace/PluginCard';
import { MarketplacePlusCard } from '../../components/marketplace/MarketplacePlusCard';
import { MarketplacePageLayout } from '../../components/marketplace/MarketplacePageLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { getAppOrigin } from '../../lib/seo';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { aiAgentsOpenGraph } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seoTitles = getPageSeoTitles(
  'Marketplace: plugins for you and your agent',
);
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...aiAgentsOpenGraph },
  description:
    'Discover plugins that teach you or your agent new workflows on top of the daily.dev API. Built and shared by developers.',
};

interface MarketplacePageProps {
  plugins: Plugin[];
}

const getMarketplaceSchema = (plugins: Plugin[]): string =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'daily.dev marketplace',
    itemListElement: plugins.map((plugin, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${getAppOrigin()}/marketplace/${plugin.id}`,
      name: plugin.name,
    })),
  });

const MarketplacePage = ({ plugins }: MarketplacePageProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  useTrackQuestClientEvent({
    eventType: ClientQuestEventType.VisitMarketplace,
  });
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), 300);
  const shouldFetch = !!debouncedQuery || !!user;
  const { data: fetchedPlugins, isFetching } = useQuery({
    ...pluginsQueryOptions(debouncedQuery, user),
    enabled: shouldFetch,
    placeholderData: keepPreviousData,
  });
  const results = shouldFetch ? fetchedPlugins ?? plugins : plugins;

  return (
    <MarketplacePageLayout title="Marketplace" className="gap-6">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: getMarketplaceSchema(plugins) }}
        />
      </Head>
      <div className="flex flex-col gap-4 laptop:flex-row laptop:items-end laptop:justify-between">
        <div className="flex flex-col gap-2">
          <Typography
            type={TypographyType.Title2}
            tag={TypographyTag.H1}
            bold
            className="hidden tablet:block"
          >
            Marketplace
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Plugins that teach you or your agent new workflows on top of the
            daily.dev API.
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            New here?{' '}
            <a
              href={pluginMarketplaceDocs}
              className="text-text-link hover:underline"
              target="_blank"
              rel={anchorDefaultRel}
            >
              How plugins work
            </a>
          </Typography>
        </div>
        <div className="flex shrink-0 gap-2">
          {user && (
            <Button
              tag="a"
              href={marketplaceSubmissionsUrl}
              className="hidden tablet:flex"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
            >
              Your plugins
            </Button>
          )}
          <Button
            tag="a"
            href={mcpServerDocs}
            className="flex-1 tablet:flex-initial"
            target="_blank"
            rel={anchorDefaultRel}
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<OpenLinkIcon />}
            iconPosition={ButtonIconPosition.Right}
          >
            Connect your agent
          </Button>
          {user && (
            <ShellActions>
              <Button
                tag="a"
                href={marketplaceSubmissionsUrl}
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
              >
                Your plugins
              </Button>
            </ShellActions>
          )}
          {user ? (
            <Button
              tag="a"
              href={marketplaceSubmitUrl}
              className="flex-1 tablet:flex-initial"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
            >
              Submit a plugin
            </Button>
          ) : (
            <Button
              type="button"
              className="flex-1 tablet:flex-initial"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={() => showLogin({ trigger: AuthTriggers.Marketplace })}
            >
              Submit a plugin
            </Button>
          )}
        </div>
      </div>
      <SearchField
        inputId="marketplace-search"
        placeholder="Search plugins"
        value={query}
        valueChanged={setQuery}
      />
      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptopL:grid-cols-3">
          {results.map((plugin, index) => (
            <Fragment key={plugin.id}>
              <PluginCard plugin={plugin} />
              {index === 1 && <MarketplacePlusCard />}
            </Fragment>
          ))}
        </div>
      )}
      {results.length === 0 && !isFetching && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="py-10 text-center"
        >
          {debouncedQuery
            ? 'No plugins match your search.'
            : 'No plugins yet. Be the first to submit one.'}
        </Typography>
      )}
    </MarketplacePageLayout>
  );
};

const getMarketplaceLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

MarketplacePage.getLayout = getMarketplaceLayout;
MarketplacePage.layoutProps = {
  screenCentered: false,
  seo,
};
export default MarketplacePage;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<MarketplacePageProps>
> {
  const res = await gqlClient.request<PluginsData>(PLUGINS_QUERY, {
    first: 50,
  });

  return {
    props: { plugins: res.plugins.edges.map(({ node }) => node) },
    revalidate: 60,
  };
}
