import {
  act,
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import nock from 'nock';
import { createTestSettings } from '../../../__tests__/fixture/settings';
import Post from '../../../__tests__/fixture/post';
import { AuthContextProvider } from '../../contexts/AuthContext';
import ChangelogTooltip from './ChangelogTooltip';
import { AlertColor, AlertDot } from '../AlertDot';
import { postDateFormat } from '../../lib/dateFormat';
import { AlertContextProvider } from '../../contexts/AlertContext';
import { Alerts, UPDATE_ALERTS } from '../../graphql/alerts';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import { ExtensionMessageType } from '../../lib/extension';
import {
  ToastNotification,
  TOAST_NOTIF_KEY,
} from '../../hooks/useToastNotification';
import SettingsContext from '../../contexts/SettingsContext';
import * as hooks from '../../hooks/useChangelog';

describe('ChangelogTooltip component', () => {
  const noop = jest.fn();
  const defaultPost = {
    ...Post,
    summary: 'Some post summary goes here for testing!',
    numUpvotes: 69,
    numComments: 42,
  };
  const updateAlerts = jest.fn();
  const defaultAlerts: Alerts = {};
  let extensionUpdateStatus = 'update_available';
  const mockSendMessageFn = jest.fn(() => ({
    status: extensionUpdateStatus,
  }));

  beforeAll(() => {
    jest.mock('webextension-polyfill', () => ({
      runtime: {
        sendMessage: mockSendMessageFn,
      },
    }));
  });

  beforeEach(async () => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.unmock('webextension-polyfill');
  });

  const renderComponent = ({
    client,
  }: {
    client: QueryClient;
  }): RenderResult => {
    return render(
      <QueryClientProvider client={client}>
        <AuthContextProvider
          user={null}
          squads={[]}
          getRedirectUri={noop}
          updateUser={noop}
          tokenRefreshed={false}
        >
          <SettingsContext.Provider value={createTestSettings()}>
            <AlertContextProvider
              alerts={defaultAlerts}
              updateAlerts={updateAlerts}
              loadedAlerts
            >
              <AlertDot color={AlertColor.Cabbage} />
              <ChangelogTooltip />
            </AlertContextProvider>
          </SettingsContext.Provider>
        </AuthContextProvider>
      </QueryClientProvider>,
    );
  };

  const mockGraphQLUpdateAlerts = () =>
    mockGraphQL({
      request: {
        query: UPDATE_ALERTS,
        variables: { data: { lastChangelog: /.*/ } },
      },
      result: () => ({
        data: { data: { lastChangelog: new Date().toISOString() } },
      }),
    });

  it('should render', async () => {
    const client = new QueryClient();
    client.setQueryData(['changelog', 'anonymous', 'latest-post'], defaultPost);

    renderComponent({ client });

    const changelogNewReleaseTag = await screen.findByTestId(
      'changelogNewReleaseTag',
    );
    expect(changelogNewReleaseTag).toBeInTheDocument();

    const changelogModalClose = await screen.findByTestId(
      'close-interactive-popup',
    );
    expect(changelogModalClose).toBeInTheDocument();

    const changelogImage = await screen.findByTestId('changelogImage');
    expect(changelogImage).toBeInTheDocument();
    expect(changelogImage).toHaveAttribute('src', defaultPost.image);

    const changelogTitle = await screen.findByTestId('changelogTitle');
    expect(changelogTitle).toBeInTheDocument();
    expect(changelogTitle).toHaveTextContent(defaultPost.title);

    const changelogDate = await screen.findByRole('time');
    expect(changelogDate).toBeInTheDocument();
    expect(changelogDate).toHaveTextContent(
      postDateFormat(defaultPost.createdAt),
    );

    const changelogSummary = await screen.findByTestId('changelogSummary');
    expect(changelogSummary).toBeInTheDocument();
    expect(changelogSummary).toHaveTextContent(defaultPost.summary);

    const changelogUpvotesCounter = await screen.findByTestId(
      'changelogUpvotesCounter',
    );
    expect(changelogUpvotesCounter).toBeInTheDocument();
    expect(changelogUpvotesCounter).toHaveTextContent(
      defaultPost.numUpvotes.toString(),
    );

    const changelogCommentsCounter = await screen.findByTestId(
      'changelogCommentsCounter',
    );
    expect(changelogCommentsCounter).toBeInTheDocument();
    expect(changelogCommentsCounter).toHaveTextContent(
      defaultPost.numComments.toString(),
    );

    const changelogReleaseNotesBtn = await screen.findByTestId(
      'changelogReleaseNotesBtn',
    );
    expect(changelogReleaseNotesBtn).toBeInTheDocument();
    expect(changelogReleaseNotesBtn).toHaveAttribute(
      'href',
      defaultPost.commentsPermalink,
    );

    const changelogExtensionBtn = screen.queryByTestId('changelogExtensionBtn');
    expect(changelogExtensionBtn).not.toBeInTheDocument();
  });

  it('should render update button when used inside extension', async () => {
    const client = new QueryClient();
    client.setQueryData(['changelog', 'anonymous', 'latest-post'], defaultPost);

    process.env.TARGET_BROWSER = 'chrome';

    renderComponent({ client });
    await screen.findByTestId('changelog');

    const changelogExtensionBtn = screen.queryByTestId('changelogExtensionBtn');
    expect(changelogExtensionBtn).toBeInTheDocument();

    delete process.env.TARGET_BROWSER;
  });

  it('should not render if post is loading or undefined', () => {
    const client = new QueryClient();
    renderComponent({ client });

    const changelogExtensionBtn = screen.queryByTestId('changelog');
    expect(changelogExtensionBtn).not.toBeInTheDocument();
  });

  it('should request extension update on update button click', async () => {
    const client = new QueryClient();
    client.setQueryData(['changelog', 'anonymous', 'latest-post'], defaultPost);

    process.env.TARGET_BROWSER = 'chrome';

    mockGraphQLUpdateAlerts();

    renderComponent({ client });
    await screen.findByTestId('changelog');

    await act(async () => {
      const changelogExtensionBtn = await screen.findByTestId(
        'changelogExtensionBtn',
      );
      fireEvent.click(changelogExtensionBtn);
      await new Promise(process.nextTick);
      await waitForNock();
    });

    expect(
      client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY),
    ).toBeDefined();
    expect(mockSendMessageFn).toHaveBeenCalledTimes(1);
    expect(mockSendMessageFn).toHaveBeenCalledWith({
      type: ExtensionMessageType.RequestUpdate,
    });
    expect(updateAlerts).toHaveBeenCalled();

    delete process.env.TARGET_BROWSER;
  });

  it('update lastChangelog on release notes click', async () => {
    const client = new QueryClient();
    client.setQueryData(['changelog', 'anonymous', 'latest-post'], defaultPost);

    mockGraphQLUpdateAlerts();

    renderComponent({ client });
    await screen.findByTestId('changelog');

    await act(async () => {
      const changelogReleaseNotesBtn = await screen.findByTestId(
        'changelogReleaseNotesBtn',
      );
      fireEvent.click(changelogReleaseNotesBtn);
      await waitForNock();
    });

    expect(updateAlerts).toHaveBeenCalled();
  });

  it('update lastChangelog on close modal click', async () => {
    const client = new QueryClient();
    client.setQueryData(['changelog', 'anonymous', 'latest-post'], defaultPost);

    mockGraphQLUpdateAlerts();

    renderComponent({ client });
    await screen.findByTestId('changelog');

    await act(async () => {
      const changelogModalClose = await screen.findByTestId(
        'close-interactive-popup',
      );
      fireEvent.click(changelogModalClose);
      await waitForNock();
    });

    expect(updateAlerts).toHaveBeenCalled();
  });

  it('should link to blog post on firefox', async () => {
    const client = new QueryClient();
    client.setQueryData(['changelog', 'anonymous', 'latest-post'], defaultPost);
    mockGraphQLUpdateAlerts();

    process.env.TARGET_BROWSER = 'firefox';

    renderComponent({ client });
    await screen.findByTestId('changelog');

    const changelogExtensionBtn = await screen.findByTestId(
      'changelogExtensionBtn',
    );

    await act(async () => {
      fireEvent.click(changelogExtensionBtn);
      await new Promise(process.nextTick);
      await waitForNock();
    });

    expect(mockSendMessageFn).not.toHaveBeenCalled();
    expect(changelogExtensionBtn.tagName.toLowerCase()).toBe('a');
    expect(changelogExtensionBtn.getAttribute('href')).toBeTruthy();

    delete process.env.TARGET_BROWSER;
  });

  it('should show toast when no extension update available', async () => {
    const client = new QueryClient();
    client.setQueryData(['changelog', 'anonymous', 'latest-post'], defaultPost);

    process.env.TARGET_BROWSER = 'chrome';

    mockGraphQLUpdateAlerts();

    renderComponent({ client });
    await screen.findByTestId('changelog');

    const changelogExtensionBtn = await screen.findByTestId(
      'changelogExtensionBtn',
    );

    extensionUpdateStatus = 'no_update';

    await act(async () => {
      fireEvent.click(changelogExtensionBtn);
      await new Promise(process.nextTick);
      await waitForNock();
    });

    expect(
      client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY),
    ).toBeDefined();

    delete process.env.TARGET_BROWSER;
  });

  it('should show toast when no extension update is throttled', async () => {
    const client = new QueryClient();
    client.setQueryData(['changelog', 'anonymous', 'latest-post'], defaultPost);

    mockGraphQLUpdateAlerts();
    process.env.TARGET_BROWSER = 'chrome';

    renderComponent({ client });
    await screen.findByTestId('changelog');

    const changelogExtensionBtn = await screen.findByTestId(
      'changelogExtensionBtn',
    );

    extensionUpdateStatus = 'throttled';

    await act(async () => {
      fireEvent.click(changelogExtensionBtn);
      await new Promise(process.nextTick);
      await waitForNock();
    });

    expect(
      client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY),
    ).toBeDefined();

    delete process.env.TARGET_BROWSER;
  });

  it('update lastChangelog on comments click', async () => {
    const client = new QueryClient();
    client.setQueryData(['changelog', 'anonymous', 'latest-post'], defaultPost);

    mockGraphQLUpdateAlerts();

    renderComponent({ client });
    await screen.findByTestId('changelog');

    await act(async () => {
      const changelogCommentsButton = await screen.findByTestId(
        'changelogCommentsButton',
      );
      fireEvent.click(changelogCommentsButton);
      await waitForNock();
    });

    expect(updateAlerts).toHaveBeenCalled();
  });

  it('calls toggleUpvote on upvote button click', async () => {
    const client = new QueryClient();
    const toggleUpvote = jest.fn();

    jest.spyOn(hooks, 'useChangelog').mockImplementation(() => ({
      toggleUpvote,
      isAvailable: true,
      latestPost: defaultPost,
      dismiss: jest.fn(),
    }));

    renderComponent({ client });
    await screen.findByTestId('changelog');

    await act(async () => {
      const changelogUpvotesButton = await screen.findByTestId(
        'changelogUpvotesButton',
      );
      fireEvent.click(changelogUpvotesButton);
    });

    expect(toggleUpvote).toHaveBeenCalledWith({
      payload: defaultPost,
      origin: 'changelog popup',
    });
  });
});
