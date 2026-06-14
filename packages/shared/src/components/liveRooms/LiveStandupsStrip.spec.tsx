import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { BOOT_QUERY_KEY } from '../../contexts/common';
import { gqlClient } from '../../graphql/common';
import type { ActiveLiveRoom } from '../../graphql/liveRooms';
import {
  ACTIVE_LIVE_ROOMS_QUERY,
  LiveRoomActivityStatus,
  LiveRoomMode,
  LiveRoomStatus,
} from '../../graphql/liveRooms';
import { LogEvent } from '../../lib/log';
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
  mode: LiveRoomMode.Moderated,
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

const renderComponent = (
  client = createClient(),
  log = { logEvent: jest.fn() },
) => ({
  log,
  ...render(
    <TestBootProvider client={client} log={log}>
      <LiveStandupsStrip />
    </TestBootProvider>,
  ),
});

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

it('renders community-moderated standups that are activity-live while durable-created', () => {
  const communityRoom: ActiveLiveRoom = {
    ...room,
    id: 'room-community',
    mode: LiveRoomMode.CommunityModerated,
    status: LiveRoomStatus.Created,
    activityStatus: LiveRoomActivityStatus.Live,
  };

  render(
    <TestBootProvider client={createClient()}>
      <LiveStandupsStrip items={[communityRoom]} />
    </TestBootProvider>,
  );

  expect(screen.getByText('Weekly product standup')).toBeInTheDocument();
});

it('logs impression once when the strip renders with live standups', async () => {
  const client = createClient();
  client.setQueryData(BOOT_QUERY_KEY, { liveRooms: { hasLive: true } });
  jest.mocked(gqlClient.request).mockResolvedValue({
    activeLiveRooms: [room],
  });

  const { log } = renderComponent(client);

  await screen.findByText('Weekly product standup');
  await waitFor(() =>
    expect(log.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.ImpressionStandupsStrip,
        extra: expect.stringContaining('"surface":"home_strip"'),
      }),
    ),
  );
});

it('logs a click event when a standup link is activated', async () => {
  const client = createClient();
  client.setQueryData(BOOT_QUERY_KEY, { liveRooms: { hasLive: true } });
  jest.mocked(gqlClient.request).mockResolvedValue({
    activeLiveRooms: [room],
  });

  const { log } = renderComponent(client);

  const link = await screen.findByRole('link');
  fireEvent.click(link);

  expect(log.logEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: LogEvent.ClickStandupsStrip,
      target_id: 'room-1',
      extra: expect.stringContaining('"surface":"home_strip"'),
    }),
  );
});
