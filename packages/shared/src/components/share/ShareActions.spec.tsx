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
import { ShareActions } from './ShareActions';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import { getShortLinkProps } from '../../hooks/utils/useGetShortUrl';
import { ShareProvider } from '../../lib/share';
import { ReferralCampaignKey } from '../../lib/referral';
import { useViewSize } from '../../hooks/useViewSize';

jest.mock('../../hooks/useViewSize', () => {
  const actual = jest.requireActual('../../hooks/useViewSize');
  return { __esModule: true, ...actual, useViewSize: jest.fn() };
});

const useViewSizeMock = useViewSize as jest.Mock;
const writeText = jest.fn().mockResolvedValue(undefined);
const onShare = jest.fn();
const link = 'https://daily.dev/posts/abc';
const text = 'Check this out';

beforeEach(() => {
  jest.clearAllMocks();
  useViewSizeMock.mockReturnValue(true); // default: laptop
  Object.assign(navigator, {
    clipboard: { writeText },
  });
});

const SHORT_LINK = 'https://dly.to/tagged';

const renderComponent = (
  props: Partial<Parameters<typeof ShareActions>[0]> = {},
): RenderResult => {
  const client = new QueryClient();
  return render(
    <TestBootProvider client={client}>
      <ShareActions link={link} text={text} onShare={onShare} {...props} />
    </TestBootProvider>,
  );
};

describe('ShareActions inline variant', () => {
  it('renders copy link plus a compact set of social networks', () => {
    renderComponent({ variant: 'inline' });

    expect(screen.getByText('Copy link')).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });

  it('copies the link and reports the CopyLink provider', async () => {
    renderComponent({ variant: 'inline' });

    await act(async () => {
      fireEvent.click(screen.getByText('Copy link'));
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(link));
    expect(onShare).toHaveBeenCalledWith(ShareProvider.CopyLink);
  });
});

describe('ShareActions social targets', () => {
  it('tags the shared link with the campaign, like the copy path', async () => {
    const open = jest.fn();
    Object.assign(window, { open });

    // `getShortUrl` keys its cache off the *tagged* url, so seeding that key
    // and seeing the value come back proves the cid reached the social path.
    // Without it the lookup misses and nothing resolves.
    const client = new QueryClient();
    const { queryKey } = getShortLinkProps(
      link,
      ReferralCampaignKey.ShareTag,
      defaultUser,
    );
    client.setQueryData(queryKey, SHORT_LINK);

    render(
      <TestBootProvider
        client={client}
        auth={{ user: defaultUser, isAuthReady: true }}
      >
        <ShareActions
          link={link}
          text={text}
          onShare={onShare}
          variant="inline"
          cid={ReferralCampaignKey.ShareTag}
        />
      </TestBootProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('social-share-X'));
    });

    await waitFor(() => expect(open).toHaveBeenCalled());
    expect(open.mock.calls[0][0]).toContain(encodeURIComponent(SHORT_LINK));
  });
});

describe('ShareActions icon variant on mobile', () => {
  beforeEach(() => useViewSizeMock.mockReturnValue(false));

  it('copies on a single tap when native share is unavailable', async () => {
    renderComponent();

    const trigger = screen.getByLabelText('Copy link');
    await act(async () => {
      fireEvent.click(trigger);
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(link));
    expect(onShare).toHaveBeenCalledWith(ShareProvider.CopyLink);
  });
});
