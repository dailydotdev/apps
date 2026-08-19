import type { Ad } from '../../graphql/posts';

/**
 * Display inventory, not deals. These never enter the claim loop, the wallet,
 * the ItemList markup or the agent feed, so they deliberately live outside
 * `mockDeals` and carry the ad server's own `Ad` shape.
 *
 * `pixel` and `tags` stay empty: this branch has no ad server, and a fabricated
 * tracker would report impressions nobody bought.
 */
export const dealsListAd: Ad = {
  source: 'Sentry',
  company: 'Sentry',
  adDomain: 'sentry.io',
  companyLogo: 'https://cdn.simpleicons.org/sentry',
  image: 'https://cdn.simpleicons.org/sentry',
  backgroundColor: '#F6F4FB',
  link: 'https://sentry.io/welcome/',
  tagLine: 'Find the bug before your users file it',
  description:
    'Error and performance monitoring that points at the commit, the release and the line that broke production.',
  callToAction: 'Try Sentry',
  providerId: 'deals-house-sentry',
};

export const dealsPageAd: Ad = {
  source: 'MongoDB',
  company: 'MongoDB',
  adDomain: 'mongodb.com',
  companyLogo: 'https://cdn.simpleicons.org/mongodb',
  image: 'https://cdn.simpleicons.org/mongodb',
  backgroundColor: '#E9F5EE',
  link: 'https://www.mongodb.com/atlas',
  tagLine: 'Ship the database, not the ops rota',
  description:
    'MongoDB Atlas runs the cluster, the backups and the scaling so your team keeps writing product code.',
  callToAction: 'Start free',
  providerId: 'deals-house-mongodb',
};
