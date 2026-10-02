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
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { Plugin } from '@dailydotdev/shared/src/graphql/plugins';
import {
  marketplaceUrl,
  myPluginsQueryOptions,
  myPluginSubmissionsQueryOptions,
} from '@dailydotdev/shared/src/graphql/plugins';
import { PluginSubmitForm } from '../../components/marketplace/PluginSubmitForm';
import { MyPluginsList } from '../../components/marketplace/MyPluginsList';
import { MarketplaceFeatureGate } from '../../components/marketplace/MarketplaceFeatureGate';
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
  const { data: submissions = [] } = useQuery(
    myPluginSubmissionsQueryOptions(user?.id),
  );
  const editId = router.query.edit as string | undefined;
  const editing = useMemo(
    () => plugins.find((plugin) => plugin.id === editId),
    [plugins, editId],
  );

  const setEditing = (plugin?: Plugin) =>
    router.replace(
      plugin
        ? { query: { edit: plugin.id } }
        : { pathname: '/marketplace/submit' },
      undefined,
      { shallow: true },
    );

  return (
    <MarketplaceFeatureGate>
      <PageWrapperLayout className="flex max-w-3xl flex-col gap-8 py-6">
        <div className="flex flex-col gap-2">
          <Link href={marketplaceUrl} prefetch={false}>
            <a className="w-fit text-text-tertiary typo-footnote hover:underline">
              ← Marketplace
            </a>
          </Link>
          <Typography type={TypographyType.Title2} tag={TypographyTag.H1} bold>
            Share a plugin
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            A plugin is a SKILL.md and/or a GitHub repository that teaches an
            agent a workflow on top of the daily.dev API. The daily.dev team
            reviews every submission before it goes live.
          </Typography>
        </div>
        <PluginSubmitForm
          key={editing?.id ?? 'new'}
          plugin={editing}
          onSubmitted={() => setEditing()}
        />
        <MyPluginsList
          plugins={plugins}
          submissions={submissions}
          onEdit={setEditing}
        />
      </PageWrapperLayout>
    </MarketplaceFeatureGate>
  );
};

const getSubmitPluginLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

SubmitPluginPage.getLayout = getSubmitPluginLayout;
SubmitPluginPage.layoutProps = { screenCentered: false, seo };
export default SubmitPluginPage;
