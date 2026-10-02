import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo/lib/types';
import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import {
  marketplaceSubmitUrl,
  marketplaceUrl,
  myPluginsQueryOptions,
  myPluginSubmissionsQueryOptions,
} from '@dailydotdev/shared/src/graphql/plugins';
import { MyPluginsList } from '../../components/marketplace/MyPluginsList';
import { MarketplacePageLayout } from '../../components/marketplace/MarketplacePageLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultSeo, noindexSeoProps } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('Your plugins'),
  ...noindexSeoProps,
};

const PluginSubmissionsPage = (): ReactElement => {
  const router = useRouter();
  const { user, isAuthReady, showLogin } = useAuthContext();
  const { data: plugins = [], isPending: isPluginsPending } = useQuery(
    myPluginsQueryOptions(user?.id),
  );
  const { data: submissions = [], isPending: isSubmissionsPending } = useQuery(
    myPluginSubmissionsQueryOptions(user?.id),
  );
  const isEmpty =
    !!user &&
    !isPluginsPending &&
    !isSubmissionsPending &&
    !plugins.length &&
    !submissions.length;

  return (
    <MarketplacePageLayout className="max-w-3xl gap-8">
      <div className="flex flex-col gap-2">
        <Link href={marketplaceUrl} prefetch={false}>
          <a className="w-fit text-text-tertiary typo-footnote hover:underline">
            ← Marketplace
          </a>
        </Link>
        <div className="flex items-center justify-between gap-4">
          <Typography type={TypographyType.Title2} tag={TypographyTag.H1} bold>
            Your plugins
          </Typography>
          <Button
            tag="a"
            href={marketplaceSubmitUrl}
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
          >
            Submit a plugin
          </Button>
        </div>
      </div>
      {isAuthReady && !user && (
        <div className="flex flex-col items-start gap-3">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Log in to see the plugins you submitted.
          </Typography>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={() => showLogin({ trigger: AuthTriggers.Marketplace })}
          >
            Log in
          </Button>
        </div>
      )}
      {isEmpty && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          You have not submitted any plugins yet.
        </Typography>
      )}
      <MyPluginsList
        plugins={plugins}
        submissions={submissions}
        onEdit={(plugin) =>
          router.push(`${marketplaceSubmitUrl}?edit=${plugin.id}`)
        }
      />
    </MarketplacePageLayout>
  );
};

const getPluginSubmissionsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

PluginSubmissionsPage.getLayout = getPluginSubmissionsLayout;
PluginSubmissionsPage.layoutProps = { screenCentered: false, seo };
export default PluginSubmissionsPage;
