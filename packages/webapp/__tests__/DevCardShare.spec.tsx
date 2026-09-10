import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import type { DevCardQueryData } from '@dailydotdev/shared/src/hooks/profile/useDevCard';
import { DevCardTheme } from '@dailydotdev/shared/src/components/profile/devcard/common';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { ShareProvider } from '@dailydotdev/shared/src/lib/share';
import { DevCardStep2 } from '../components/layouts/SettingsLayout/Customization/DevCard/DevCardStep2';

const writeText = jest.fn();
const logEvent = jest.fn();

const devCard: DevCardQueryData = {
  devCard: {
    id: 'dc1',
    user: { ...loggedUser, premium: false, reputation: 10 },
    createdAt: '2024-01-01T00:00:00.000Z',
    theme: DevCardTheme.Default,
    isProfileCover: false,
    showBorder: true,
    reputation: 10,
    articlesRead: 3,
    tags: [],
    sources: [],
    streak: { max: 1 },
  },
  userStreakProfile: { max: 1 },
};

beforeEach(() => {
  jest.clearAllMocks();
  writeText.mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
});

it('copies the profile link with the share campaign on it', async () => {
  const client = new QueryClient();
  client.setQueryData(
    generateQueryKey(RequestKey.DevCard, { id: loggedUser.id }),
    devCard,
  );

  render(
    <TestBootProvider
      client={client}
      auth={{ user: loggedUser }}
      log={{ logEvent }}
    >
      <DevCardStep2 initialDevCardSrc="https://api.daily.dev/devcard.png" />
    </TestBootProvider>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Share' }));

  await waitFor(() =>
    expect(writeText).toHaveBeenCalledWith(
      `${loggedUser.permalink}?userid=${loggedUser.id}&cid=share_profile`,
    ),
  );
  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.ShareDevcard,
    target_id: loggedUser.id,
    extra: JSON.stringify({
      provider: ShareProvider.CopyLink,
      origin: Origin.DevCard,
    }),
  });
});
