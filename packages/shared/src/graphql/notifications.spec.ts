import { gqlClient } from './common';
import {
  SYNC_WEB_PUSH_SUBSCRIPTION_MUTATION,
  syncWebPushSubscription,
} from './notifications';

jest.mock('./common', () => ({
  gqlClient: {
    request: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

it('should sync web push subscription', async () => {
  jest.mocked(gqlClient.request).mockResolvedValue({
    syncWebPushSubscription: {
      cleanedUpSubscriptions: 2,
    },
  });

  await expect(
    syncWebPushSubscription({
      subscriptionId: '11111111-1111-4111-8111-111111111111',
      origin: 'https://daily.dev',
      optedIn: true,
    }),
  ).resolves.toEqual({
    cleanedUpSubscriptions: 2,
  });

  expect(gqlClient.request).toHaveBeenCalledWith(
    SYNC_WEB_PUSH_SUBSCRIPTION_MUTATION,
    {
      input: {
        subscriptionId: '11111111-1111-4111-8111-111111111111',
        origin: 'https://daily.dev',
        optedIn: true,
      },
    },
  );
});
