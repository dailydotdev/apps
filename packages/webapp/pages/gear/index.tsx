import type { ReactElement } from 'react';
import React from 'react';
import type { GetStaticPropsResult } from 'next';
import type { NextSeoProps } from 'next-seo/lib/types';

import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { useRouter } from 'next/router';
import { BreadCrumbs } from '@dailydotdev/shared/src/components/header/BreadCrumbs';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { GearTopList } from '@dailydotdev/shared/src/components/cards/Leaderboard/GearTopList';
import {
  GearCategory,
  GEAR_CATEGORY_LABELS,
  GEAR_DIRECTORY_QUERY,
} from '@dailydotdev/shared/src/graphql/user/gear';
import type {
  GearDirectoryData,
  PopularGearItem,
} from '@dailydotdev/shared/src/graphql/user/gear';
import { GearCategoryNudge } from '@dailydotdev/shared/src/components/gear/GearCategoryNudge';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seoDescription =
  'Discover the most popular developer gear ranked by category. See what keyboards, monitors, mice, and other workspace gear top developers use.';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Popular developer gear & workspace setups'),
  openGraph: { ...defaultOpenGraph },
  description: seoDescription,
};

const DISPLAY_CATEGORIES = [
  GearCategory.Computer,
  GearCategory.Monitor,
  GearCategory.Keyboard,
  GearCategory.Mouse,
  GearCategory.Headphones,
  GearCategory.Desk,
  GearCategory.Webcam,
  GearCategory.Microphone,
  GearCategory.Other,
];

type GearPageProps = {
  gearByCategory: Record<string, PopularGearItem[]>;
};

const GearPage = ({ gearByCategory }: GearPageProps): ReactElement => {
  const { isFallback: isLoading } = useRouter();

  if (isLoading) {
    return <></>;
  }

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-slow bg-accent-cabbage-default/10 absolute -left-32 -top-32 h-96 w-96 rounded-full blur-3xl" />
        <div className="animate-float-slow-reverse bg-accent-onion-default/[0.08] absolute -right-32 -top-16 h-64 w-64 rounded-full blur-3xl" />
        <div className="animate-float-slow-delayed bg-accent-water-default/[0.06] absolute -bottom-20 left-1/3 h-48 w-48 rounded-full blur-3xl" />
      </div>

      <PageWrapperLayout className="py-6">
        <BreadCrumbs>
          <SettingsIcon size={IconSize.XSmall} secondary /> Gear
        </BreadCrumbs>
        <header className="mt-6 flex items-center gap-3">
          <SettingsIcon
            size={IconSize.XXLarge}
            className="text-text-primary"
            secondary
          />
          <div className="flex flex-col">
            <h1 className="font-bold text-text-primary typo-title2 laptop:typo-title1">
              Developer Gear Rankings
            </h1>
            <p className="text-text-tertiary typo-footnote">{seoDescription}</p>
          </div>
        </header>
        <div className="mt-6 grid grid-cols-1 gap-6 tablet:grid-cols-2 laptopXL:grid-cols-3">
          {DISPLAY_CATEGORIES.map((category) => {
            const items = gearByCategory[category] ?? [];

            if (items.length === 0) {
              return null;
            }

            return (
              <GearTopList
                key={category}
                containerProps={{
                  title: GEAR_CATEGORY_LABELS[category],
                  className:
                    'overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle',
                }}
                category={category}
                items={items}
                isLoading={isLoading}
                footer={<GearCategoryNudge />}
              />
            );
          })}
        </div>
      </PageWrapperLayout>
    </div>
  );
};

const getGearPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

GearPage.getLayout = getGearPageLayout;
GearPage.layoutProps = {
  screenCentered: false,
  seo,
};
export default GearPage;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<GearPageProps>
> {
  try {
    const res = await gqlClient.request<GearDirectoryData>(
      GEAR_DIRECTORY_QUERY,
    );

    const gearByCategory = Object.fromEntries(
      DISPLAY_CATEGORIES.map((category) => [category, res[category] ?? []]),
    );

    return {
      props: { gearByCategory },
      revalidate: 60,
    };
  } catch (err) {
    const error = err as GraphQLError;
    if (
      [ApiError.NotFound, ApiError.Forbidden].includes(
        error?.response?.errors?.[0]?.extensions?.code,
      )
    ) {
      return {
        props: { gearByCategory: {} },
        revalidate: 60,
      };
    }
    throw err;
  }
}
