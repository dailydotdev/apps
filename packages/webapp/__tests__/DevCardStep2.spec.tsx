import React from 'react';
import type { RenderResult } from '@testing-library/react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/lib/referral';
import { getShortLinkProps } from '@dailydotdev/shared/src/hooks/utils/useGetShortUrl';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import type { Feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { downloadUrl } from '@dailydotdev/shared/src/lib/blob';
import { GENERATE_DEVCARD_MUTATION } from '../graphql/devcard';
import { DevCardStep2 } from '../components/layouts/SettingsLayout/Customization/DevCard/DevCardStep2';

jest.mock('react-parallax-tilt', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock(
  '@dailydotdev/shared/src/components/profile/devcard/DevCardFetchWrapper',
  () => ({
    DevCardFetchWrapper: () => <div data-testid="devcard-preview" />,
  }),
);

jest.mock('@dailydotdev/shared/src/hooks/profile/useDevCard', () => ({
  useDevCard: () => ({
    devcard: { theme: 'default', showBorder: true, isProfileCover: false },
    isLoading: false,
    coverImage: 'https://daily.dev/cover.png',
  }),
}));

jest.mock('@dailydotdev/shared/src/hooks/useViewSize', () => {
  const actual = jest.requireActual(
    '@dailydotdev/shared/src/hooks/useViewSize',
  );
  return { __esModule: true, ...actual, useViewSize: jest.fn() };
});

jest.mock('@dailydotdev/shared/src/hooks/useToastNotification', () => {
  const actual = jest.requireActual(
    '@dailydotdev/shared/src/hooks/useToastNotification',
  );
  return { __esModule: true, ...actual, useToastNotification: jest.fn() };
});

jest.mock('@dailydotdev/shared/src/hooks/useConditionalFeature', () => ({
  __esModule: true,
  useConditionalFeature: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/lib/blob', () => {
  const actual = jest.requireActual('@dailydotdev/shared/src/lib/blob');
  return { __esModule: true, ...actual, downloadUrl: jest.fn() };
});

const useViewSizeMock = useViewSize as jest.Mock;
const useToastNotificationMock = useToastNotification as jest.Mock;
const useConditionalFeatureMock = useConditionalFeature as jest.Mock;
const displayToast = jest.fn();
const writeText = jest.fn().mockResolvedValue(undefined);
const shortUrl = 'https://dly.to/devcard';
const shareLabel = 'Share DevCard';
const shareText = 'Check out my DevCard on daily.dev';

const renderComponent = ({
  isFlagOn = true,
  isLaptop = true,
}: { isFlagOn?: boolean; isLaptop?: boolean } = {}): RenderResult => {
  // The download button renders as an anchor on small screens; keep it a button
  // so both flag states are compared on the same element.
  useViewSizeMock.mockImplementation((size: ViewSize) =>
    size === ViewSize.Laptop ? isLaptop : false,
  );
  useConditionalFeatureMock.mockImplementation(
    ({ feature }: { feature: Feature<boolean> }) => ({
      value: isFlagOn ? true : feature.defaultValue,
      isLoading: false,
    }),
  );

  const client = new QueryClient();
  // The share link is shortened through the referral campaign, so seed the
  // resolved short URL instead of letting the copy path hit the network.
  const { queryKey } = getShortLinkProps(
    loggedUser.permalink,
    ReferralCampaignKey.ShareProfile,
    loggedUser,
  );
  client.setQueryData(queryKey, shortUrl);

  return render(
    <TestBootProvider client={client} auth={{ user: loggedUser }}>
      <DevCardStep2 />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  useToastNotificationMock.mockReturnValue({
    displayToast,
    dismissToast: jest.fn(),
  });
  Object.assign(navigator, { clipboard: { writeText } });
  // `shouldUseNativeShare` checks for the API's presence, so it has to be
  // absent rather than undefined for the copy fallback.
  const shareable: { share?: unknown } = navigator;
  delete shareable.share;
  Object.defineProperty(navigator, 'maxTouchPoints', {
    value: 0,
    configurable: true,
  });
});

describe('DevCardStep2 share action with the flag off', () => {
  it('keeps the download-only action row', () => {
    renderComponent({ isFlagOn: false });

    expect(screen.getByText('Download DevCard')).toBeInTheDocument();
    expect(screen.queryByLabelText(shareLabel)).not.toBeInTheDocument();
  });

  it('keeps the original standalone centering on the download button', () => {
    renderComponent({ isFlagOn: false });

    const download = screen.getByText('Download DevCard').closest('button');
    expect(download).toHaveClass('mx-auto', 'mt-4', 'self-start');
  });
});

describe('DevCardStep2 share action with the flag on', () => {
  it('renders a labelled share control next to the download button', () => {
    renderComponent();

    expect(screen.getByText('Download DevCard')).toBeInTheDocument();
    expect(screen.getByLabelText(shareLabel)).toBeInTheDocument();
  });

  it('keeps the download action working', async () => {
    mockGraphQL({
      request: {
        query: GENERATE_DEVCARD_MUTATION,
        variables: {
          type: 'DEFAULT',
          theme: 'DEFAULT',
          showBorder: true,
          isProfileCover: false,
        },
      },
      result: () => ({
        data: { devCard: { imageUrl: 'https://daily.dev/dc.png' } },
      }),
    });

    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByText('Download DevCard'));
    });

    await waitFor(() =>
      expect(downloadUrl).toHaveBeenCalledWith({
        url: 'https://daily.dev/dc.png',
        filename: `${loggedUser.username}.png`,
      }),
    );
  });

  it('copies the shortened profile link when native share is unavailable', async () => {
    renderComponent({ isLaptop: false });

    await act(async () => {
      fireEvent.click(screen.getByLabelText(shareLabel));
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(shortUrl));
    expect(displayToast).toHaveBeenCalledWith(
      '✅ Copied link to clipboard',
      expect.anything(),
    );
  });

  it('opens the native share sheet on mobile when it is available', async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true,
    });

    renderComponent({ isLaptop: false });

    await act(async () => {
      fireEvent.click(screen.getByLabelText(shareLabel));
    });

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        text: `${shareText}\n${shortUrl}`,
      }),
    );
    expect(writeText).not.toHaveBeenCalled();
  });
});
