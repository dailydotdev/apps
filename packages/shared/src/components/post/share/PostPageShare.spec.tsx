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
import { CopySummaryButton } from './CopySummaryButton';
import { ShareWithTeamStrip } from './ShareWithTeamStrip';
import { ShareMobile } from '../../ShareMobile';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import defaultPost from '../../../../__tests__/fixture/post';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { TOAST_NOTIF_KEY } from '../../../hooks/useToastNotification';
import { useViewSize } from '../../../hooks/useViewSize';
import { useSharePostPage } from '../../../hooks/useSharePostPage';
import { Origin } from '../../../lib/log';

jest.mock('../../../hooks/useViewSize', () => {
  const actual = jest.requireActual('../../../hooks/useViewSize');
  return { __esModule: true, ...actual, useViewSize: jest.fn() };
});

jest.mock('../../../hooks/useSharePostPage', () => ({
  __esModule: true,
  useSharePostPage: jest.fn(),
}));

const useViewSizeMock = useViewSize as jest.Mock;
const useSharePostPageMock = useSharePostPage as jest.Mock;
const writeText = jest.fn().mockResolvedValue(undefined);
const nativeShare = jest.fn().mockResolvedValue(undefined);

const summary =
  'React Compiler memoizes components automatically, so most useMemo calls become dead weight.';

const articlePost: Post = { ...defaultPost, summary };
// Freeform posts are authored inside daily.dev and never carry a TL;DR.
const freeformPost: Post = {
  ...defaultPost,
  type: PostType.Freeform,
  summary: undefined,
};

let client: QueryClient;

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  client = new QueryClient();
  useViewSizeMock.mockReturnValue(true); // default: laptop
  useSharePostPageMock.mockReturnValue(true);
  Object.assign(navigator, { clipboard: { writeText } });
});

const renderComponent = (ui: React.ReactElement): RenderResult =>
  render(<TestBootProvider client={client}>{ui}</TestBootProvider>);

const getToast = () =>
  client.getQueryData<{ message: string }>(TOAST_NOTIF_KEY);

describe('CopySummaryButton', () => {
  it('copies the summary plus the post link and shows a toast', async () => {
    const logEvent = jest.fn();
    render(
      <TestBootProvider client={client} log={{ logEvent }}>
        <CopySummaryButton post={articlePost} summary={summary} />
      </TestBootProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy summary'));
    });

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        `${summary}\n\n${articlePost.commentsPermalink}`,
      ),
    );
    expect(getToast()?.message).toEqual('✅ Copied summary to clipboard');
    await waitFor(() =>
      expect(logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          extra: expect.stringContaining(Origin.PostSummary),
        }),
      ),
    );
  });

  it('renders nothing for a freeform post, which has no summary', () => {
    renderComponent(
      <CopySummaryButton post={freeformPost} summary={freeformPost.summary} />,
    );

    expect(screen.queryByLabelText('Copy summary')).not.toBeInTheDocument();
  });
});

describe('ShareWithTeamStrip', () => {
  it('copies the post link so it can be pasted into Slack', async () => {
    renderComponent(<ShareWithTeamStrip post={articlePost} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Send to Slack'));
    });

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(articlePost.commentsPermalink),
    );
    expect(getToast()?.message).toEqual(
      '✅ Link copied — paste it in any Slack channel',
    );
  });

  it('uses the native share sheet on mobile', async () => {
    useViewSizeMock.mockReturnValue(false);
    Object.assign(navigator, { share: nativeShare, maxTouchPoints: 5 });
    renderComponent(<ShareWithTeamStrip post={articlePost} />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('More sharing options'));
    });

    await waitFor(() => expect(nativeShare).toHaveBeenCalled());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).share;
  });
});

describe('post page share flag', () => {
  const renderShareMobile = () =>
    renderComponent(
      <ShareMobile
        post={articlePost}
        link={articlePost.commentsPermalink}
        origin={Origin.ArticlePage}
        onCopyPostLink={jest.fn()}
      />,
    );

  it('keeps the existing share widget when the flag is off', () => {
    useSharePostPageMock.mockReturnValue(false);
    renderShareMobile();

    expect(
      screen.queryByText('Know someone who should read this?'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Copy link')).toBeInTheDocument();
    expect(screen.getByText('Share with your friends')).toBeInTheDocument();
  });

  it('adds the encouraging heading when the flag is on', () => {
    renderShareMobile();

    expect(
      screen.getByText('Know someone who should read this?'),
    ).toBeInTheDocument();
    expect(screen.getByText('Copy link')).toBeInTheDocument();
  });
});
