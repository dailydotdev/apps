import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { generateTestSquad } from '../../../../../__tests__/fixture/squads';
import loggedUser from '../../../../../__tests__/fixture/loggedUser';
import type { Squad } from '../../../../graphql/sources';
import type { AdSquadItem } from '../../../../hooks/useFeed';
import { FeedItemType } from '../../common/common';
import { SquadAdGrid } from './SquadAdGrid';

const renderCard = (squad: Squad) =>
  render(
    <TestBootProvider client={new QueryClient()} auth={{ user: loggedUser }}>
      <SquadAdGrid
        item={
          {
            type: FeedItemType.Ad,
            index: 0,
            updatedAt: 0,
            dataUpdatedAt: 0,
            ad: {
              source: 'booster',
              providerId: '',
              pixel: [],
              data: { source: squad },
            },
          } as unknown as AdSquadItem
        }
        onClickAd={jest.fn()}
      />
    </TestBootProvider>,
  );

describe('SquadAdGrid', () => {
  it('offers to join a squad the reader is not in, with no view button', () => {
    renderCard(
      generateTestSquad({ handle: 'boosted', currentMember: undefined }),
    );

    expect(
      screen.getByRole('button', { name: 'Join Squad' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('View Squad')).not.toBeInTheDocument();
  });

  it('keeps View Squad for a member', () => {
    renderCard(generateTestSquad({ handle: 'boosted' }));

    expect(
      screen.queryByRole('button', { name: 'Join Squad' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View Squad' }),
    ).toBeInTheDocument();
  });
});
