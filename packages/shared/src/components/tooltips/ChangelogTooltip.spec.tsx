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

describe('ChangelogTooltip component', () => {
  const noop = jest.fn();
  const defaultPost = Post;
  const client = new QueryClient();
  const updateAlerts = jest.fn();
  const defaultAlerts: Alerts = {};

  beforeEach(async () => {
    nock.cleanAll();
    jest.clearAllMocks();
    client.clear();
  });

  const renderComponent = (): RenderResult => {
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
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );

    await act(async () => {
      renderComponent();
      await screen.findByTestId('changelog');
    });

    const changelogNewReleaseTag = screen.getByTestId('changelogNewReleaseTag');
    expect(changelogNewReleaseTag).toBeInTheDocument();

    const changelogModalClose = screen.getByTestId('changelogModalClose');
    expect(changelogModalClose).toBeInTheDocument();

    const changelogImage = screen.getByTestId('changelogImage');
    expect(changelogImage).toBeInTheDocument();
    expect(changelogImage).toHaveAttribute('src', defaultPost.image);

    const changelogTitle = screen.getByTestId('changelogTitle');
    expect(changelogTitle).toBeInTheDocument();
    expect(changelogTitle).toHaveTextContent(defaultPost.title);

    const changelogDate = screen.getByTestId('changelogDate');
    expect(changelogDate).toBeInTheDocument();
    expect(changelogDate).toHaveTextContent(
      postDateFormat(defaultPost.createdAt),
    );

    const changelogReleaseNotesBtn = screen.getByTestId(
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
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );

    process.env.TARGET_BROWSER = 'chrome';

    await act(async () => {
      renderComponent();
      await screen.findByTestId('changelog');
    });

    const changelogExtensionBtn = screen.queryByTestId('changelogExtensionBtn');
    expect(changelogExtensionBtn).toBeInTheDocument();

    delete process.env.TARGET_BROWSER;
  });

  it('should not render if post is loading or undefined', async () => {
    await act(async () => {
      renderComponent();
    });

    const changelogExtensionBtn = screen.queryByTestId('changelog');
    expect(changelogExtensionBtn).not.toBeInTheDocument();
  });

  it('should request extension update on update button click', async () => {
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );

    process.env.TARGET_BROWSER = 'chrome';

    const sendMessageFn = jest.fn();
    global.browser = {
      runtime: {
        sendMessage: sendMessageFn,
      },
    };

    await act(async () => {
      renderComponent();
      await screen.findByTestId('changelog');
    });

    act(() => {
      const changelogExtensionBtn = screen.getByTestId('changelogExtensionBtn');
      fireEvent.click(changelogExtensionBtn);
    });

    expect(sendMessageFn).toHaveBeenCalledTimes(1);
    expect(sendMessageFn).toHaveBeenCalledWith({
      type: ExtensionMessageType.RequestUpdate,
    });

    delete process.env.TARGET_BROWSER;
    delete global.browser;
  });

  it('update lastChangelog on release notes click', async () => {
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

    await act(async () => {
      renderComponent();
      await screen.findByTestId('changelog');
    });

    await act(async () => {
      const changelogReleaseNotesBtn = screen.getByTestId(
        'changelogReleaseNotesBtn',
      );
      fireEvent.click(changelogReleaseNotesBtn);
      await waitForNock();
    });

    expect(updateAlerts).toHaveBeenCalled();
  });

  it('update lastChangelog on close modal click', async () => {
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

    await act(async () => {
      renderComponent();
      await screen.findByTestId('changelog');
    });

    await act(async () => {
      const changelogModalClose = screen.getByTestId('changelogModalClose');
      fireEvent.click(changelogModalClose);
      await waitForNock();
    });

    expect(updateAlerts).toHaveBeenCalled();
  });

  it('should link to blog post on firefox', async () => {
    client.setQueryData(
      ['changelog', 'latest-post', { loggedIn: false }],
      defaultPost,
    );

    process.env.TARGET_BROWSER = 'firefox';

    const sendMessageFn = jest.fn();
    global.browser = {
      runtime: {
        sendMessage: sendMessageFn,
      },
    };

    await act(async () => {
      renderComponent();
      await screen.findByTestId('changelog');
    });

    const changelogExtensionBtn = screen.getByTestId('changelogExtensionBtn');

    expect(changelogExtensionBtn.tagName.toLowerCase()).toBe('a');
    expect(changelogExtensionBtn.getAttribute('href')).not.toBeNull();

    delete process.env.TARGET_BROWSER;
    delete global.browser;
  });
});
