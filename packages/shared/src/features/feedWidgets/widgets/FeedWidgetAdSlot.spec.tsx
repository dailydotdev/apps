import React from 'react';
import nock from 'nock';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { QueryClient } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import basePost from '../../../../__tests__/fixture/post';
import baseAd from '../../../../__tests__/fixture/ad';
import { generateTestSquad } from '../../../../__tests__/fixture/squads';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import type { Ad } from '../../../graphql/posts';
import { AdActions } from '../../../lib/ads';
import { webappUrl } from '../../../lib/constants';
import { FeedWidgetAdSlot } from './FeedWidgetAdSlot';
import { getFeedWidgetModalFeedName } from './FeedWidgetBoostedAd';
import { FeedWidgetsProvider } from '../FeedWidgetsContext';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const logEvent = jest.fn();
const push = jest.fn();

const mockRouter = (query: NextRouter['query'] = {}) =>
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        route: '/',
        pathname: '/',
        asPath: '/',
        query,
        push,
        replace: jest.fn(),
        isReady: true,
        events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
      } as unknown as NextRouter),
  );

const boostedPostAd = (): Ad =>
  ({
    source: 'booster',
    providerId: '',
    pixel: [],
    data: {
      post: {
        ...basePost,
        id: 'boosted-post',
        slug: 'boosted-post',
        title: 'Deploying Kubernetes on OpenStack',
      },
    },
  } as unknown as Ad);

const renderSlot = (ad: Ad) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser }}
      log={{ logEvent }}
    >
      <FeedWidgetsProvider feedName="popular" isEditing={false}>
        <FeedWidgetAdSlot ad={ad} isEditing={false} />
      </FeedWidgetsProvider>
    </TestBootProvider>,
  );

const adImpressions = () =>
  logEvent.mock.calls
    .map(([event]) => event)
    .filter(
      (event) =>
        event.event_name === AdActions.Impression && event.target_type === 'ad',
    );

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  push.mockResolvedValue(true);
  mockRouter();
});

describe('FeedWidgetAdSlot', () => {
  it('renders a regular creative as the ad card', () => {
    renderSlot({ ...baseAd });

    expect(screen.getByTestId('adItem')).toBeInTheDocument();
    expect(screen.getByText('I am an ad!')).toBeInTheDocument();
  });

  it('renders a post boost as the boosted post card', () => {
    renderSlot(boostedPostAd());

    expect(screen.queryByTestId('adItem')).not.toBeInTheDocument();
    expect(
      screen.getByText('Deploying Kubernetes on OpenStack'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('postItem')).toBeInTheDocument();

    act(() => mockAllIsIntersecting(true));
    expect(adImpressions()).toHaveLength(1);
  });

  it('opens a boosted post in the post modal, as the feed does', async () => {
    renderSlot(boostedPostAd());

    fireEvent.click(
      screen.getByRole('link', { name: 'Deploying Kubernetes on OpenStack' }),
    );

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        expect.stringContaining(
          `pmcid=${encodeURIComponent(getFeedWidgetModalFeedName('popular'))}`,
        ),
        `${webappUrl}posts/boosted-post`,
        { scroll: false, shallow: true },
      ),
    );
    expect(push.mock.calls[0][0]).toContain('pmid=boosted-post');
  });

  it('renders the post modal once the route carries the boosted post', async () => {
    mockRouter({
      pmid: 'boosted-post',
      pmcid: getFeedWidgetModalFeedName('popular'),
    });
    nock('http://localhost:3000')
      .persist()
      .post('/graphql')
      .reply(200, { data: { viewPost: { _: true } } });

    renderSlot(boostedPostAd());

    await screen.findByRole('dialog');
  });

  it('renders a squad boost as the boosted squad card', () => {
    const squad = generateTestSquad({
      id: 'boosted-squad',
      handle: 'boosted',
      name: 'Boosted squad',
      currentMember: undefined,
    });
    renderSlot({
      source: 'booster',
      providerId: '',
      pixel: [],
      data: { source: squad },
    } as unknown as Ad);

    expect(screen.getByText('Boosted squad')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Join Squad' }),
    ).toBeInTheDocument();
  });
});
