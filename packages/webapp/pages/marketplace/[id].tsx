import type { ReactElement } from 'react';
import React from 'react';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo/lib/types';
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
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { OpenLinkIcon } from '@dailydotdev/shared/src/components/icons/OpenLink';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { RenderMarkdown } from '@dailydotdev/shared/src/components/RenderMarkdown';
import SquadPostAuthor from '@dailydotdev/shared/src/components/post/SquadPostAuthor';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import type {
  Plugin,
  PluginData,
} from '@dailydotdev/shared/src/graphql/plugins';
import {
  getPluginSkillMdUrl,
  marketplaceSubmitUrl,
  marketplaceUrl,
  PLUGIN_QUERY,
} from '@dailydotdev/shared/src/graphql/plugins';

import { getPluginLinkHost } from '../../components/marketplace/PluginCard';
import { MarketplacePageLayout } from '../../components/marketplace/MarketplacePageLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { getAppOrigin } from '../../lib/seo';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

interface PluginPageProps {
  plugin: Plugin;
  seo: NextSeoProps;
}

const getPluginSchema = (plugin: Plugin): string =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: plugin.name,
    description: plugin.description,
    applicationCategory: 'DeveloperApplication',
    url: `${getAppOrigin()}/marketplace/${plugin.id}`,
    author: { '@type': 'Person', name: plugin.author.name },
    ...(plugin.url && { sameAs: plugin.url }),
    dateModified: plugin.updatedAt,
  });

const PluginPage = ({ plugin }: PluginPageProps): ReactElement => {
  const { isFallback } = useRouter();
  const { user } = useAuthContext();

  if (isFallback || !plugin) {
    return <></>;
  }

  const isAuthor = user?.id === plugin.author.id;

  return (
    <MarketplacePageLayout className="gap-6">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: getPluginSchema(plugin) }}
        />
      </Head>
      <Link href={marketplaceUrl} prefetch={false}>
        <a className="w-fit text-text-tertiary typo-footnote hover:underline">
          ← Marketplace
        </a>
      </Link>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <Typography type={TypographyType.Title2} tag={TypographyTag.H1} bold>
            {plugin.name}
          </Typography>
          {isAuthor && (
            <Button
              tag="a"
              href={`${marketplaceSubmitUrl}?edit=${plugin.id}`}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<EditIcon />}
            >
              Edit
            </Button>
          )}
        </div>
        <SquadPostAuthor
          author={plugin.author}
          date={plugin.updatedAt}
          size={ProfileImageSize.Large}
          isUserSource
          showSkeletonWhenMissing={false}
        />
        <div className="flex flex-wrap gap-2">
          {plugin.url && (
            <Button
              tag="a"
              href={plugin.url}
              target="_blank"
              rel="nofollow ugc noopener"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<OpenLinkIcon />}
            >
              {getPluginLinkHost(plugin.url)}
            </Button>
          )}
          {plugin.hasSkillMd && (
            <Button
              tag="a"
              href={getPluginSkillMdUrl(plugin.id)}
              target="_blank"
              rel="noopener"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<OpenLinkIcon />}
            >
              SKILL.md
            </Button>
          )}
        </div>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          {plugin.description}
        </Typography>
      </div>
      {plugin.about && (
        <div className="rounded-16 border border-border-subtlest-tertiary p-4">
          <RenderMarkdown
            content={plugin.about}
            reactMarkdownProps={{
              disallowedElements: ['a', 'img'],
              unwrapDisallowed: true,
            }}
          />
        </div>
      )}
    </MarketplacePageLayout>
  );
};

const getPluginPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

PluginPage.getLayout = getPluginPageLayout;
PluginPage.layoutProps = { screenCentered: false };
export default PluginPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

interface PluginPageParams extends ParsedUrlQuery {
  id: string;
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PluginPageParams>): Promise<
  GetStaticPropsResult<PluginPageProps>
> {
  try {
    const { plugin } = await gqlClient.request<PluginData>(PLUGIN_QUERY, {
      id: params?.id,
    });
    const seoTitles = getPageSeoTitles(`${plugin.name} plugin`);

    return {
      props: {
        plugin,
        seo: {
          ...defaultSeo,
          ...seoTitles,
          openGraph: { ...defaultOpenGraph, ...seoTitles.openGraph },
          description: plugin.description,
        },
      },
      revalidate: 3600,
    };
  } catch (err) {
    const error = err as GraphQLError;
    if (
      [ApiError.NotFound, ApiError.Forbidden].includes(
        error?.response?.errors?.[0]?.extensions?.code,
      )
    ) {
      return { notFound: true, revalidate: 60 };
    }
    throw err;
  }
}
