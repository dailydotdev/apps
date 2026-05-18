import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { BOOT_QUERY_KEY } from '../../contexts/common';
import { gqlClient } from '../../graphql/common';
import type { ActiveLiveRoom } from '../../graphql/liveRooms';
import {
  ACTIVE_LIVE_ROOMS_QUERY,
  LiveRoomStatus,
} from '../../graphql/liveRooms';
import { LiveStandupsStrip } from './LiveStandupsStrip';

jest.mock('../../graphql/common', () => ({
  ...jest.requireActual('../../graphql/common'),
  gqlClient: {
    request: jest.fn(),
  },
}));

const createClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const room: ActiveLiveRoom = {
  id: 'room-1',
  topic: 'Weekly product standup',
  status: LiveRoomStatus.Live,
  participantCount: 12,
  host: {
    id: 'host-1',
    name: 'Ido Shamun',
    username: 'idoshamun',
    image: '',
    permalink: 'https://app.daily.dev/idoshamun',
  },
};

const renderComponent = (client = createClient()) =>
  render(
    <TestBootProvider client={client}>
      <LiveStandupsStrip />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

it('does not query active standups when boot has no live-room hint', () => {
  const client = createClient();
  client.setQueryData(BOOT_QUERY_KEY, { liveRooms: { hasLive: false } });

  renderComponent(client);

  expect(screen.queryByLabelText('Live standups')).not.toBeInTheDocument();
  expect(gqlClient.request).not.toHaveBeenCalledWith(
    ACTIVE_LIVE_ROOMS_QUERY,
    expect.anything(),
  );
});

it('fetches and renders active standups when boot has a live-room hint', async () => {
  const client = createClient();
  client.setQueryData(BOOT_QUERY_KEY, { liveRooms: { hasLive: true } });
  jest.mocked(gqlClient.request).mockResolvedValue({
    activeLiveRooms: [room],
  });

  renderComponent(client);

  expect(await screen.findByText('Weekly product standup')).toBeInTheDocument();
  expect(screen.getByText('with Ido Shamun · 12 watching')).toBeInTheDocument();
  expect(screen.getByRole('link')).toHaveAttribute('href', '/standups/room-1');
  await waitFor(() =>
    expect(gqlClient.request).toHaveBeenCalledWith(
      ACTIVE_LIVE_ROOMS_QUERY,
      expect.objectContaining({ limit: expect.any(Number) }),
    ),
  );
});
