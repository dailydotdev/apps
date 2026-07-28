import type { ComponentProps } from 'react';
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

// The prompt is no longer flag-gated, so GrowthBook is set up only to satisfy
// the boot provider — no feature it defines changes what renders here.
const renderComponent = (
  client = createClient(),
  props: Partial<ComponentProps<typeof PostContentShare>> = {},
): void => {
  const gb = new GrowthBook();

  mockGraphQL({
    request: { query: GET_SHORT_URL_QUERY, variables: { url: trackedUrl } },
    result: { data: { getShortUrl: SHORT_LINK } },
  });

  render(
    <TestBootProvider client={client} auth={{ user: loggedUser }} gb={gb}>
      <PostContentShare post={post} {...props} />
    </TestBootProvider>,
  );
};

// The card is no longer the default treatment, so the tests that cover its
// tile row and close button have to ask for it by name.
const renderCard = (client = createClient()): void =>
  renderComponent(client, { promptVariant: 'card' });

describe('PostContentShare', () => {
  it('renders the existing widget when asked for the control treatment', async () => {
    renderComponent(createClient(), { promptVariant: 'control' });

    expect(
      await screen.findByText('Should anyone else see this post?'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Good call. Now pass it on.'),
    ).not.toBeInTheDocument();
    expect(screen.getByDisplayValue(SHORT_LINK)).toBeInTheDocument();
  });

  it('defaults to the flat band on top of the resolved short URL', async () => {
    renderComponent();

    expect(await screen.findByText('Enjoyed this post?')).toBeInTheDocument();
    expect(
      screen.queryByText('Should anyone else see this post?'),
    ).not.toBeInTheDocument();
    // One control rather than the tile row. jsdom reports a non-laptop
    // viewport, which is the path where `ShareActions` drops the chevron and
    // leaves a single button — so the absence of the tiles is what this
    // asserts, not the presence of the dropdown.
    expect(screen.getByText('Copy link')).toBeInTheDocument();
    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument();
  });

  it('renders the card treatment when asked for it', async () => {
    renderCard();

    expect(
      await screen.findByText('Good call. Now pass it on.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Copy link')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });

  it('copies the short link to the clipboard and toasts', async () => {
    const client = createClient();
    renderCard(client);

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

    renderCard();

    await screen.findByText('Good call. Now pass it on.');

    await act(async () => {
      fireEvent.click(screen.getByText('Share via...'));
    });

    await waitFor(() => expect(nativeShare).toHaveBeenCalled());
    expect(nativeShare.mock.calls[0][0].text).toContain(SHORT_LINK);
    expect(writeText).not.toHaveBeenCalled();
  });

  // The prompt keys off `usePostActions`, not `post.userState.vote`. Only the
  // feed cards used to record that interaction, so upvoting from the post page
  // itself left this empty and the prompt never appeared. Guard the empty case
  // so a regression shows up here rather than as "the strip doesn't work".
  it('renders nothing until an upvote interaction is recorded', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    client.setQueryData(
      generateQueryKey(RequestKey.PostActions, { id: post.id }),
      { interaction: 'none', previousInteraction: 'none' },
    );

    renderComponent(client);

    await waitFor(() =>
      expect(screen.queryByText('Enjoyed this post?')).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByText('Should anyone else see this post?'),
    ).not.toBeInTheDocument();
  });

  it('dismisses the prompt from the close button', async () => {
    renderCard();

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
