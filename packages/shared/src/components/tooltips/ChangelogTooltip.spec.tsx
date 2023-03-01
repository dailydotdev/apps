import {
  act,
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import React, { useRef } from 'react';
import nock from 'nock';
import { renderHook } from '@testing-library/react-hooks';
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

describe('ChangelogTooltip component', () => {
  const noop = jest.fn();
  const defaultPost = {
    ...Post,
    summary: 'Some post summary goes here for testing!',
  };
  const updateAlerts = jest.fn();
  const defaultAlerts: Alerts = {};
  let extensionUpdateStatus = 'update_available';
  const sendMessageFn = jest.fn(() => ({
    status: extensionUpdateStatus,
  }));

  beforeEach(async () => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  const renderComponent = ({
    client,
  }: {
    client: QueryClient;
  }): RenderResult => {
    const {
      result: { current: changelogBadgeRef },
    } = renderHook(() => useRef());

    return render(
      <QueryClientProvider client={client}>
        <AuthContextProvider
          user={null}
          squads={[]}
          getRedirectUri={noop}
          updateUser={noop}
          tokenRefreshed={false}
        >
          <AlertContextProvider
            alerts={defaultAlerts}
            updateAlerts={updateAlerts}
            loadedAlerts
          >
            <AlertDot ref={changelogBadgeRef} color={AlertColor.Cabbage} />
            <ChangelogTooltip elementRef={changelogBadgeRef} />
          </AlertContextProvider>
        </AuthContextProvider>
      </QueryClientProvider>,
    );
  };

  it('should render', async () => {
    const client = new QueryClient();
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );

    renderComponent({ client });

    const changelogNewReleaseTag = await screen.findByTestId(
      'changelogNewReleaseTag',
    );
    expect(changelogNewReleaseTag).toBeInTheDocument();

    const changelogModalClose = await screen.findByTestId(
      'changelogModalClose',
    );
    expect(changelogModalClose).toBeInTheDocument();

    const changelogImage = await screen.findByTestId('changelogImage');
    expect(changelogImage).toBeInTheDocument();
    expect(changelogImage).toHaveAttribute('src', defaultPost.image);

    const changelogTitle = await screen.findByTestId('changelogTitle');
    expect(changelogTitle).toBeInTheDocument();
    expect(changelogTitle).toHaveTextContent(defaultPost.title);

    const changelogDate = await screen.findByTestId('changelogDate');
    expect(changelogDate).toBeInTheDocument();
    expect(changelogDate).toHaveTextContent(
      postDateFormat(defaultPost.createdAt),
    );

    const changelogSummary = await screen.findByTestId('changelogSummary');
    expect(changelogSummary).toBeInTheDocument();
    expect(changelogSummary).toHaveTextContent(defaultPost.summary);

    const changelogActionBar = await screen.findByTestId('changelogActionBar');
    expect(changelogActionBar).toBeInTheDocument();

    const changelogReleaseNotesBtn = await screen.findByTestId(
      'changelogReleaseNotesBtn',
    );
    expect(changelogReleaseNotesBtn).toBeInTheDocument();
    expect(changelogReleaseNotesBtn).toHaveAttribute(
      'href',
      defaultPost.permalink,
    );

    const changelogExtensionBtn = screen.queryByTestId('changelogExtensionBtn');
    expect(changelogExtensionBtn).not.toBeInTheDocument();
  });

  it('should render update button when used inside extension', async () => {
    const client = new QueryClient();
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );

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
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );

    process.env.TARGET_BROWSER = 'chrome';

    global.browser = {
      runtime: {
        sendMessage: sendMessageFn,
      },
    };

    renderComponent({ client });
    await screen.findByTestId('changelog');

    await act(async () => {
      const changelogExtensionBtn = await screen.findByTestId(
        'changelogExtensionBtn',
      );
      fireEvent.click(changelogExtensionBtn);
      await new Promise(process.nextTick);
    });

    expect(
      client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY),
    ).toBeDefined();
    expect(sendMessageFn).toHaveBeenCalledTimes(1);
    expect(sendMessageFn).toHaveBeenCalledWith({
      type: ExtensionMessageType.RequestUpdate,
    });

    delete process.env.TARGET_BROWSER;
    delete global.browser;
  });

  it('update lastChangelog on release notes click', async () => {
    const client = new QueryClient();
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );

    mockGraphQL({
      request: {
        query: UPDATE_ALERTS,
        variables: { data: { lastChangelog: /.*/ } },
      },
      result: () => ({
        data: { data: { lastChangelog: new Date().toISOString() } },
      }),
    });

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
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );

    mockGraphQL({
      request: {
        query: UPDATE_ALERTS,
        variables: { data: { lastChangelog: /.*/ } },
      },
      result: () => ({
        data: { data: { lastChangelog: new Date().toISOString() } },
      }),
    });

    renderComponent({ client });
    await screen.findByTestId('changelog');

    await act(async () => {
      const changelogModalClose = await screen.findByTestId(
        'changelogModalClose',
      );
      fireEvent.click(changelogModalClose);
      await waitForNock();
    });

    expect(updateAlerts).toHaveBeenCalled();
  });

  it('should link to blog post on firefox', async () => {
    const client = new QueryClient();
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );

    process.env.TARGET_BROWSER = 'firefox';

    renderComponent({ client });
    await screen.findByTestId('changelog');

    const changelogExtensionBtn = await screen.findByTestId(
      'changelogExtensionBtn',
    );

    await act(async () => {
      fireEvent.click(changelogExtensionBtn);
      await new Promise(process.nextTick);
    });

    expect(sendMessageFn).not.toHaveBeenCalled();
    expect(changelogExtensionBtn.tagName.toLowerCase()).toBe('a');
    expect(changelogExtensionBtn.getAttribute('href')).toBeTruthy();

    delete process.env.TARGET_BROWSER;
  });

  it('should show toast when no extension update available', async () => {
    const client = new QueryClient();
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );

    process.env.TARGET_BROWSER = 'chrome';

    global.browser = {
      runtime: {
        sendMessage: sendMessageFn,
      },
    };

    renderComponent({ client });
    await screen.findByTestId('changelog');

    const changelogExtensionBtn = await screen.findByTestId(
      'changelogExtensionBtn',
    );

    extensionUpdateStatus = 'no_update';

    await act(async () => {
      fireEvent.click(changelogExtensionBtn);
      await new Promise(process.nextTick);
    });

    expect(
      client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY),
    ).toBeDefined();

    delete process.env.TARGET_BROWSER;
    delete global.browser;
  });

  it('should show toast when no extension update is throttled', async () => {
    const client = new QueryClient();
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );

    process.env.TARGET_BROWSER = 'chrome';

    global.browser = {
      runtime: {
        sendMessage: sendMessageFn,
      },
    };

    renderComponent({ client });
    await screen.findByTestId('changelog');

    const changelogExtensionBtn = await screen.findByTestId(
      'changelogExtensionBtn',
    );

    extensionUpdateStatus = 'throttled';

    await act(async () => {
      fireEvent.click(changelogExtensionBtn);
      await new Promise(process.nextTick);
    });

    expect(
      client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY),
    ).toBeDefined();

    delete process.env.TARGET_BROWSER;
    delete global.browser;
  });
});
