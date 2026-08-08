import { MOCK_NOW_MS } from './mockDeals';

export interface DealComment {
  id: string;
  author: string;
  handle: string;
  createdAt: string;
  body: string;
}

const hoursFromMockNow = (hours: number): string =>
  new Date(MOCK_NOW_MS + hours * 60 * 60 * 1000).toISOString();

export const mockComments: DealComment[] = [
  {
    id: 'c-generic-1',
    author: 'Maya Okonkwo',
    handle: '@mayabuilds',
    createdAt: hoursFromMockNow(-2),
    body: 'Applied on the first try. The discount came off before tax.',
  },
  {
    id: 'c-generic-2',
    author: 'Tomer Levi',
    handle: '@tlevi',
    createdAt: hoursFromMockNow(-6),
    body: 'Heads up, it does not stack with the student rate. Had to pick one.',
  },
  {
    id: 'c-generic-3',
    author: 'Priya Raman',
    handle: '@priyacodes',
    createdAt: hoursFromMockNow(-24),
    body: 'Second deal I grabbed here this month. Team is finally off the free tier.',
  },
];

const commentsByDeal: Record<string, DealComment[]> = {
  'd-keychron-code': [
    {
      id: 'c-keychron-1',
      author: 'Dana Ruiz',
      handle: '@danatypes',
      createdAt: hoursFromMockNow(-3),
      body: 'Worked on the Q1 Pro too, not just the base board. Shipping was still full price.',
    },
    {
      id: 'c-keychron-2',
      author: 'Sven Larsen',
      handle: '@svenkeys',
      createdAt: hoursFromMockNow(-9),
      body: 'Code failed on the limited edition colourway, fine on everything else.',
    },
  ],
  'd-cursor-credit': [
    {
      id: 'c-cursor-1',
      author: 'Ana Beltran',
      handle: '@anabuilds',
      createdAt: hoursFromMockNow(-1),
      body: 'Credit showed up on the second invoice, not the first. Worth the wait.',
    },
    {
      id: 'c-cursor-2',
      author: 'Kenji Mori',
      handle: '@kenjidev',
      createdAt: hoursFromMockNow(-5),
      body: 'Only counts if you never had Pro before. My old trial account was rejected.',
    },
  ],
  'd-digitalocean-credit': [
    {
      id: 'c-do-1',
      author: 'Lucia Moreau',
      handle: '@luciaships',
      createdAt: hoursFromMockNow(-1),
      body: 'Covered a droplet plus managed Postgres for the whole 60 days.',
    },
    {
      id: 'c-do-2',
      author: 'Femi Adeyemi',
      handle: '@femistack',
      createdAt: hoursFromMockNow(-8),
      body: 'Needs a card on file before the credit lands, so budget for the hold.',
    },
  ],
};

export const getDealComments = (dealId: string): DealComment[] =>
  commentsByDeal[dealId] ?? mockComments;
