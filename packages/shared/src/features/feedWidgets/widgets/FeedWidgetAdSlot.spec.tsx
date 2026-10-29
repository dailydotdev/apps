import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import basePost from '../../../../__tests__/fixture/post';
import baseAd from '../../../../__tests__/fixture/ad';
import { generateTestSquad } from '../../../../__tests__/fixture/squads';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import type { Ad } from '../../../graphql/posts';
import { AdActions } from '../../../lib/ads';
import { FeedWidgetAdSlot } from './FeedWidgetAdSlot';
import { FeedWidgetsProvider } from '../FeedWidgetsContext';

const logEvent = jest.fn();

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
});

describe('FeedWidgetAdSlot', () => {
  it('renders a regular creative as the ad card', () => {
    renderSlot({ ...baseAd });

    expect(screen.getByTestId('adItem')).toBeInTheDocument();
    expect(screen.getByText('I am an ad!')).toBeInTheDocument();
  });

  it('renders a post boost as the boosted post card', () => {
    const post = {
      ...basePost,
      id: 'boosted-post',
      title: 'Deploying Kubernetes on OpenStack',
    };
    renderSlot({
      source: 'booster',
      providerId: '',
      pixel: [],
      data: { post },
    } as unknown as Ad);

    expect(screen.queryByTestId('adItem')).not.toBeInTheDocument();
    expect(
      screen.getByText('Deploying Kubernetes on OpenStack'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('postItem')).toBeInTheDocument();

    act(() => mockAllIsIntersecting(true));
    expect(adImpressions()).toHaveLength(1);
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
