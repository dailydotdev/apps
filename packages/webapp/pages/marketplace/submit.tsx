import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo/lib/types';
import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  oauthAppsDocs,
  pluginMarketplaceDocs,
  settingsUrl,
} from '@dailydotdev/shared/src/lib/constants';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import {
  marketplaceSubmissionsUrl,
  marketplaceUrl,
  myPluginsQueryOptions,
} from '@dailydotdev/shared/src/graphql/plugins';
import { PluginSubmitForm } from '../../components/marketplace/PluginSubmitForm';
import { MarketplacePageLayout } from '../../components/marketplace/MarketplacePageLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultSeo, noindexSeoProps } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('Submit a plugin'),
  ...noindexSeoProps,
};

const SubmitPluginPage = (): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { data: plugins = [] } = useQuery(myPluginsQueryOptions(user?.id));
  const editId = router.query.edit as string | undefined;
  const editing = useMemo(
    () => plugins.find((plugin) => plugin.id === editId),
    [plugins, editId],
  );

  return (
    <MarketplacePageLayout
      title={editing ? `Update ${editing.name}` : 'Share a plugin'}
      className="max-w-3xl gap-8"
    >
      <div className="flex flex-col gap-2">
        <Link href={marketplaceUrl} prefetch={false}>
          <a className="w-fit text-text-tertiary typo-footnote hover:underline">
            ← Marketplace
          </a>
        </Link>
        <Typography type={TypographyType.Title2} tag={TypographyTag.H1} bold>
          {editing ? `Update ${editing.name}` : 'Submit a plugin'}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          A plugin is an about page plus agent instructions (SKILL.md), a link,
          or both, built on top of the daily.dev API. The daily.dev team reviews
          every submission before it goes live.{' '}
          <a
            href={pluginMarketplaceDocs}
            className="text-text-link hover:underline"
            target="_blank"
            rel={anchorDefaultRel}
          >
            Read the docs
          </a>
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Building an app or service that other developers use?{' '}
          <a
            href={`${settingsUrl}/api#oauth-apps`}
            className="text-text-link hover:underline"
          >
            Register it as an OAuth app
          </a>{' '}
          so people can sign in with daily.dev and your app calls the API on
          their behalf, without a personal API token.{' '}
          <a
            href={oauthAppsDocs}
            className="text-text-link hover:underline"
            target="_blank"
            rel={anchorDefaultRel}
          >
            OAuth docs
          </a>
        </Typography>
      </div>
      <PluginSubmitForm
        key={editing?.id ?? 'new'}
        plugin={editing}
        onSubmitted={() => router.push(marketplaceSubmissionsUrl)}
      />
    </MarketplacePageLayout>
  );
};

const getSubmitPluginLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

SubmitPluginPage.getLayout = getSubmitPluginLayout;
SubmitPluginPage.layoutProps = { screenCentered: false, seo };
export default SubmitPluginPage;
