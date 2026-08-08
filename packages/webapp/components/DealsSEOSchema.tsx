import type { ReactElement } from 'react';
import React from 'react';
import Head from 'next/head';
import type { Deal } from '@dailydotdev/shared/src/features/deals/types';
import { DealAvailability } from '@dailydotdev/shared/src/features/deals/types';
import type { DealCrumb } from '@dailydotdev/shared/src/features/deals/components/DealBreadcrumbs';
import {
  getDealAvailability,
  getDealBrandPath,
  getDealPath,
} from '@dailydotdev/shared/src/features/deals/dealsFormat';
import { getAppOrigin, getDealImageUrl } from '../lib/seo';

const appOrigin = getAppOrigin();

export const DEALS_DIRECTORY_PATH = '/deals';

const toUrl = (path: string): string => `${appOrigin}${path}`;

const availabilityToSchema: Record<DealAvailability, string> = {
  [DealAvailability.InStock]: 'https://schema.org/InStock',
  [DealAvailability.SoldOut]: 'https://schema.org/SoldOut',
  [DealAvailability.Expired]: 'https://schema.org/Discontinued',
};

/**
 * One crumb list per route, consumed by both the visible breadcrumb and the
 * BreadcrumbList below, so the two cannot drift.
 */
export const getDealCrumbs = (deal: Deal): DealCrumb[] => [
  { name: 'Deals', path: DEALS_DIRECTORY_PATH },
  { name: deal.brand.name, path: getDealBrandPath(deal.brand) },
  { name: deal.title },
];

export const getDealBrandCrumbs = (brandName: string): DealCrumb[] => [
  { name: 'Deals', path: DEALS_DIRECTORY_PATH },
  { name: brandName },
];

export const getDealCategoryCrumbs = (category: string): DealCrumb[] => [
  { name: 'Deals', path: DEALS_DIRECTORY_PATH },
  { name: category },
];

const getBreadcrumbList = (
  crumbs: DealCrumb[],
  pageUrl: string,
): Record<string, unknown> => ({
  '@type': 'BreadcrumbList',
  '@id': `${pageUrl}#breadcrumbs`,
  itemListElement: crumbs.map(({ name, path }, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    ...(path && { item: toUrl(path) }),
  })),
});

const getItemList = (
  deals: Deal[],
  pageUrl: string,
): Record<string, unknown> => ({
  '@type': 'ItemList',
  '@id': `${pageUrl}#deals`,
  numberOfItems: deals.length,
  itemListElement: deals.map((deal, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: deal.title,
    url: toUrl(getDealPath(deal)),
  })),
});

/**
 * Only the fields the directory can substantiate reach the Offer node. A price
 * we never collected or a discount we cannot evidence would be a markup
 * mismatch, which is a manual-action risk on a coupon surface.
 */
const getOffer = (deal: Deal, pageUrl: string): Record<string, unknown> => {
  const discount = (() => {
    if (deal.discountPercent) {
      return { discount: `${deal.discountPercent}%` };
    }

    if (deal.discountAmount) {
      return {
        discount: deal.discountAmount,
        ...(deal.priceCurrency && { discountCurrency: deal.priceCurrency }),
      };
    }

    return {};
  })();

  const imageUrl = getDealImageUrl(deal);

  return {
    '@type': 'Offer',
    '@id': `${pageUrl}#offer`,
    name: deal.title,
    description: deal.description,
    url: pageUrl,
    ...(imageUrl && { image: imageUrl }),
    availability: availabilityToSchema[getDealAvailability(deal)],
    seller: {
      '@type': 'Organization',
      name: deal.brand.name,
      url: `https://${deal.brand.domain}`,
    },
    ...(deal.priceCurrency && { priceCurrency: deal.priceCurrency }),
    ...(typeof deal.price === 'number' && { price: deal.price }),
    ...discount,
    ...(deal.code && { discountCode: deal.code }),
    ...(deal.validFrom && { validFrom: deal.validFrom }),
    ...(deal.validThrough && { validThrough: deal.validThrough }),
  };
};

export const getDealPageJsonLd = (deal: Deal): string => {
  const pageUrl = toUrl(getDealPath(deal));
  const imageUrl = getDealImageUrl(deal);

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: deal.title,
        description: deal.description,
        ...(imageUrl && { image: imageUrl }),
        datePublished: deal.publishedAt,
        dateModified: deal.updatedAt,
        isPartOf: { '@type': 'WebSite', url: appOrigin },
        mainEntity: { '@id': `${pageUrl}#offer` },
      },
      getOffer(deal, pageUrl),
      getBreadcrumbList(getDealCrumbs(deal), pageUrl),
    ],
  });
};

export interface DealsCollectionJsonLdProps {
  deals: Deal[];
  path: string;
  name: string;
  description: string;
  crumbs: DealCrumb[];
}

export const getDealsCollectionJsonLd = ({
  deals,
  path,
  name,
  description,
  crumbs,
}: DealsCollectionJsonLdProps): string => {
  const pageUrl = toUrl(path);

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name,
        description,
        isPartOf: { '@type': 'WebSite', url: appOrigin },
      },
      getBreadcrumbList(crumbs, pageUrl),
      ...(deals.length ? [getItemList(deals, pageUrl)] : []),
    ],
  });
};

export const DealsSEOSchema = ({
  jsonLd,
}: {
  jsonLd: string;
}): ReactElement => (
  <Head>
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  </Head>
);
