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
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featureOAuthApps } from '@dailydotdev/shared/src/lib/featureManagement';
import { settingsUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
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
  const { value: isOAuthAppsEnabled } = useConditionalFeature({
    feature: featureOAuthApps,
    shouldEvaluate: !!user,
  });
  const { data: plugins = [] } = useQuery(myPluginsQueryOptions(user?.id));
  const editId = router.query.edit as string | undefined;
  const editing = useMemo(
    () => plugins.find((plugin) => plugin.id === editId),
    [plugins, editId],
  );

  return (
    <MarketplacePageLayout className="max-w-3xl gap-8">
      <div className="flex flex-col gap-2">
        <Link href={marketplaceUrl} prefetch={false}>
          <a className="w-fit text-text-tertiary typo-footnote hover:underline">
            ← Marketplace
          </a>
        </Link>
        <Typography type={TypographyType.Title2} tag={TypographyTag.H1} bold>
          {editing ? `Update ${editing.name}` : 'Share a plugin'}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          A plugin is an about page plus agent instructions (SKILL.md), a link,
          or both, built on top of the daily.dev API. The daily.dev team reviews
          every submission before it goes live.
        </Typography>
      </div>
      <PluginSubmitForm
        key={editing?.id ?? 'new'}
        plugin={editing}
        onSubmitted={() => router.push(marketplaceSubmissionsUrl)}
      />
      {isOAuthAppsEnabled && (
        <div className="flex flex-col items-start gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
          <Typography type={TypographyType.Body} bold>
            Building an app on top of the API?
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            If your plugin is an app or service that other developers use,
            register it as an OAuth app. People then sign in with daily.dev and
            approve access, and your app calls the daily.dev API on their
            behalf, without asking them to create and paste a personal API
            token.
          </Typography>
          <Button
            tag="a"
            href={`${settingsUrl}/api#oauth-apps`}
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
          >
            Set up an OAuth app
          </Button>
        </div>
      )}
    </MarketplacePageLayout>
  );
};

const getSubmitPluginLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

SubmitPluginPage.getLayout = getSubmitPluginLayout;
SubmitPluginPage.layoutProps = { screenCentered: false, seo };
export default SubmitPluginPage;
