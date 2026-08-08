import type { NextSeoProps } from 'next-seo';
import type {
  Deal,
  DealBrand,
} from '@dailydotdev/shared/src/features/deals/types';
import {
  formatFullNumber,
  getClaimEvidence,
  getDealBrandPath,
  getDealCategoryPath,
  getDealOfferNoun,
  getDealPath,
  getDealValueHeadline,
  shouldNoindexDeal,
} from '@dailydotdev/shared/src/features/deals/dealsFormat';
import { defaultOpenGraph, noindexSeoProps } from '../next-seo';
import { getPageSeoTitles } from '../components/layouts/utils';
import { getAppOrigin, getDealSocialImage } from './seo';

const appOrigin = getAppOrigin();

export const DEALS_DIRECTORY_TITLE =
  'Developer deals, promo codes and startup credits';

export const DEALS_DIRECTORY_DESCRIPTION =
  'Promo codes, startup credits and free tiers for developer tools, each one claimed and rated by developers on daily.dev.';

const buildSeo = ({
  title,
  description,
  path,
  noindex,
  image,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  image?: { url: string; alt: string };
}): NextSeoProps => {
  const seoTitles = getPageSeoTitles(title);

  return {
    title: seoTitles.title,
    description,
    canonical: `${appOrigin}${path}`,
    openGraph: {
      ...defaultOpenGraph,
      ...seoTitles.openGraph,
      description,
      images: image ? [image] : defaultOpenGraph.images,
    },
    ...(noindex ? noindexSeoProps : {}),
  };
};

export const getDealsDirectorySeo = (): NextSeoProps =>
  buildSeo({
    title: DEALS_DIRECTORY_TITLE,
    description: DEALS_DIRECTORY_DESCRIPTION,
    path: '/deals',
  });

export const getDealCategoryHeading = (category: string): string =>
  `${category} deals and promo codes`;

export const getDealCategoryIntro = (category: string, deals: Deal[]): string =>
  `${formatFullNumber(
    deals.length,
  )} live ${category.toLowerCase()} offers for developers, with the claim counts and success rates the community reported.`;

export const getDealCategorySeo = (
  category: string,
  deals: Deal[],
): NextSeoProps =>
  buildSeo({
    title: getDealCategoryHeading(category),
    description: getDealCategoryIntro(category, deals),
    path: getDealCategoryPath(category),
  });

export const getDealBrandHeading = (brand: DealBrand): string =>
  `${brand.name} promo codes and deals`;

export const getDealBrandIntro = (brand: DealBrand, deals: Deal[]): string =>
  `${formatFullNumber(deals.length)} live ${
    brand.name
  } offers on daily.dev, from promo codes to credits and free tiers, each with the claim count and success rate developers reported.`;

export const getDealBrandSeo = (
  brand: DealBrand,
  deals: Deal[],
): NextSeoProps =>
  buildSeo({
    title: getDealBrandHeading(brand),
    description: getDealBrandIntro(brand, deals),
    path: getDealBrandPath(brand),
  });

export const getDealTitle = (deal: Deal): string =>
  `${deal.brand.name} ${getDealOfferNoun(deal)}, ${getDealValueHeadline(deal)}`;

export const getDealDescription = (deal: Deal): string =>
  `${deal.title}. ${getClaimEvidence(deal)}.`;

export const getDealSeo = (deal: Deal, now: number): NextSeoProps =>
  buildSeo({
    title: getDealTitle(deal),
    description: getDealDescription(deal),
    path: getDealPath(deal),
    noindex: shouldNoindexDeal(deal, now),
    image: getDealSocialImage(deal),
  });
