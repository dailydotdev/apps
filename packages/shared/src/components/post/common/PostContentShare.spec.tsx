import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { PostContentShare } from './PostContentShare';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import post from '../../../../__tests__/fixture/post';
import { GET_SHORT_URL_QUERY } from '../../../graphql/urlShortener';
import { getShortLinkProps } from '../../../hooks/utils/useGetShortUrl';
import { ReferralCampaignKey } from '../../../lib/referral';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { TOAST_NOTIF_KEY } from '../../../hooks/useToastNotification';
import { shouldUseNativeShare } from '../../../lib/func';

jest.mock('../../../lib/func', () => {
  const actual = jest.requireActual('../../../lib/func');
  return {
    __esModule: true,
    ...actual,
    shouldUseNativeShare: jest.fn(),
  };
});

const shouldUseNativeShareMock = shouldUseNativeShare as jest.Mock;
const writeText = jest.fn().mockResolvedValue(undefined);
const nativeShare = jest.fn().mockResolvedValue(undefined);
const SHORT_LINK = 'https://dly.to/abc123';

const { trackedUrl } = getShortLinkProps(
  post.commentsPermalink,
  ReferralCampaignKey.SharePost,
  loggedUser,
);

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  shouldUseNativeShareMock.mockReturnValue(false);
  Object.assign(navigator, { clipboard: { writeText } });
});

const createClient = (): QueryClient => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(
    generateQueryKey(RequestKey.PostActions, { id: post.id }),
    { interaction: 'upvote', previousInteraction: 'none' },
  );

  return client;
};

const renderComponent = (enabled: boolean, client = createClient()): void => {
  const gb = new GrowthBook();
  gb.setFeatures({
    sharing_visibility: { defaultValue: enabled },
    share_upvote_prompt: { defaultValue: enabled },
  });

  mockGraphQL({
    request: { query: GET_SHORT_URL_QUERY, variables: { url: trackedUrl } },
    result: { data: { getShortUrl: SHORT_LINK } },
  });

  render(
    <TestBootProvider client={client} auth={{ user: loggedUser }} gb={gb}>
      <PostContentShare post={post} />
    </TestBootProvider>,
  );
};

describe('PostContentShare with the flag off', () => {
  it('renders the existing widget unchanged', async () => {
    renderComponent(false);

    expect(
      await screen.findByText('Should anyone else see this post?'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Good call. Now pass it on.'),
    ).not.toBeInTheDocument();
    expect(screen.getByDisplayValue(SHORT_LINK)).toBeInTheDocument();
  });
});

describe('PostContentShare with the flag on', () => {
  it('renders the redesigned prompt on top of the resolved short URL', async () => {
    renderComponent(true);

    expect(
      await screen.findByText('Good call. Now pass it on.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Should anyone else see this post?'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Copy link')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });

  it('copies the short link to the clipboard and toasts', async () => {
    const client = createClient();
    renderComponent(true, client);

    await screen.findByText('Good call. Now pass it on.');

    await act(async () => {
      fireEvent.click(screen.getByText('Copy link'));
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(SHORT_LINK));
    expect(client.getQueryData(TOAST_NOTIF_KEY)).toMatchObject({
      message: '✅ Copied link to clipboard',
    });
  });

  it('opens the native share sheet on mobile', async () => {
    shouldUseNativeShareMock.mockReturnValue(true);
    Object.assign(navigator, { share: nativeShare });

    renderComponent(true);

    await screen.findByText('Good call. Now pass it on.');

    await act(async () => {
      fireEvent.click(screen.getByText('Share via...'));
    });

    await waitFor(() => expect(nativeShare).toHaveBeenCalled());
    expect(nativeShare.mock.calls[0][0].text).toContain(SHORT_LINK);
    expect(writeText).not.toHaveBeenCalled();
  });

  it('dismisses the prompt from the close button', async () => {
    renderComponent(true);

    await screen.findByText('Good call. Now pass it on.');

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Dismiss share prompt'));
    });

    await waitFor(() =>
      expect(
        screen.queryByText('Good call. Now pass it on.'),
      ).not.toBeInTheDocument(),
    );
  });
});
