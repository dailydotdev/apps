import React from 'react';
import '@testing-library/jest-dom';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import {
  completeActionMock,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import App from './App';

jest.mock('content-scripts-register-polyfill', () => ({}));

jest.mock('webextension-polyfill', () => {
  return {
    contentScripts: {
      register: jest.fn(),
    },
    scripting: {
      getRegisteredContentScripts: jest.fn().mockImplementation(() => []),
      registerContentScripts: jest.fn(),
    },
    runtime: {
      id: 123,
      getURL: () => '',
      onMessage: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
      sendMessage: () =>
        new Promise((resolve) => {
          resolve(true);
        }),
    },
    permissions: {
      remove: jest.fn(),
      request: () =>
        new Promise((resolve) => {
          resolve(true);
        }),
    },
  };
});

const defaultPostData = {
  bookmarked: true,
  commentsPermalink: 'https://app.daily.dev/posts/62S6GrSzK',
  id: '62S6GrSzK',
  numComments: 1,
  numUpvotes: 6,
  source: { id: 'gamedevacademy', name: 'GameDev Academy' },
  summary:
    'In this lesson, we’ll compare the differences between promises and Async/await. We also learn how to handle errors in JavaScript using try catch blocks. In the next video, we take a look at the differences in promises and Await and then decide which one to use for this course.',
  title: 'Learn Asynchronus Programming – JavaScript Tutorial',
  trending: true,
  upvoted: true,
  downvoted: false,
  userState: {
    vote: UserVote.Up,
  },
};

const renderComponent = (postdata, settings): RenderResult => {
  return render(
    <App
      postData={{ ...defaultPostData, ...postdata }}
      settings={settings}
      url="https://gamedevacademy.org/javascript-asynchronus-programming-tutorial/"
      alerts={{
        rankLastSeen: new Date(),
      }}
      visit={{
        visitId: '123',
        sessionId: '456',
      }}
      user={defaultUser}
      deviceId="123"
      accessToken={{ token: '', expiresIn: '' }}
      squads={[]}
    />,
  );
};

describe('companion app', () => {
  it('should render the companion app', async () => {
    renderComponent({}, {});
    const wrapper = await screen.findByTestId('companion');
    expect(wrapper).toBeInTheDocument();
  });

  it('should not render the companion is opt out', async () => {
    const { container } = renderComponent({}, { optOutCompanion: true });
    expect(container).toBeEmptyDOMElement();
  });

  it('should toggle the companion open', async () => {
    renderComponent({}, {});
    const wrapper = await screen.findByTestId('companion');
    expect(wrapper).toHaveClass('translate-x-[22.5rem]');
    const toggleButton = await screen.findByLabelText('Open summary');
    expect(toggleButton).toBeInTheDocument();
    await toggleButton.click();
    expect(await screen.findByTestId('companion')).toHaveClass('translate-x-0');
    expect(await screen.findByText('TLDR -')).toBeInTheDocument();
  });

  it('should show amount of upvotes', async () => {
    renderComponent({}, {});
    const wrapper = await screen.findByTestId('companion');
    expect(wrapper).toHaveClass('translate-x-[22.5rem]');
    const toggleButton = await screen.findByLabelText('Open summary');
    expect(toggleButton).toBeInTheDocument();
    await toggleButton.click();
    expect(await screen.findByText('6 Upvotes')).toBeInTheDocument();
  });

  it('should show upvoted icon unselected', async () => {
    renderComponent(
      {
        userState: {
          vote: UserVote.None,
        },
      },
      {},
    );
    await screen.findByTestId('companion');
    const button = await screen.findByLabelText('Upvote');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('should show upvoted icon selected', async () => {
    renderComponent({}, {});
    await screen.findByTestId('companion');
    const button = await screen.findByLabelText('Remove upvote');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should show amount of comments', async () => {
    renderComponent({}, {});
    const wrapper = await screen.findByTestId('companion');
    expect(wrapper).toHaveClass('translate-x-[22.5rem]');
    const toggleButton = await screen.findByLabelText('Open summary');
    expect(toggleButton).toBeInTheDocument();
    await toggleButton.click();
    expect(await screen.findByText('1 Comment')).toBeInTheDocument();
  });

  it('should show bookmark icon selected', async () => {
    renderComponent({}, {});
    await screen.findByTestId('companion');
    const el = await screen.findByLabelText('Remove from bookmarks');
    expect(el).toBeInTheDocument();
  });

  it('should show bookmark icon unselected', async () => {
    renderComponent({ bookmarked: false }, {});
    await screen.findByTestId('companion');
    const el = await screen.findByLabelText('Save to bookmarks');
    expect(el).toBeInTheDocument();
  });

  it('should show report menu', async () => {
    renderComponent({}, {});
    await screen.findByTestId('companion');
    const button = await screen.findByLabelText('More options');
    await button.click();
    expect(await screen.findByText('Report')).toBeInTheDocument();
  });

  it('should show report menu', async () => {
    renderComponent({}, {});
    await screen.findByTestId('companion');
    const button = await screen.findByText('1 Comment');
    fireEvent.click(button);
    expect(await screen.findByText('Discussion')).toBeInTheDocument();
  });

  it('should show downvoted icon unselected', async () => {
    renderComponent(
      {
        userState: {
          vote: UserVote.Up,
        },
      },
      {},
    );
    await screen.findByTestId('companion');
    const optionsButton = await screen.findByLabelText('More options');
    fireEvent.click(optionsButton);
    await screen.findByText('Report');
    const downvote = await screen.findByLabelText('Downvote');
    expect(downvote).toHaveAttribute('aria-pressed', 'false');
  });

  it('should show downvoted icon selected', async () => {
    renderComponent(
      {
        userState: {
          vote: UserVote.Down,
        },
      },
      {},
    );
    await screen.findByTestId('companion');
    const optionsButton = await screen.findByLabelText('More options');
    fireEvent.click(optionsButton);
    await screen.findByText('Report');
    const downvote = await screen.findByLabelText('Remove downvote');
    expect(downvote).toHaveAttribute('aria-pressed', 'true');
  });

  it('should decrement number of upvotes if downvoting post that was upvoted', async () => {
    mockGraphQL(completeActionMock({ action: ActionType.VotePost }));

    renderComponent(
      {
        userState: {
          vote: UserVote.Up,
        },
        numUpvotes: 6,
      },
      {},
    );
    await screen.findByTestId('companion');
    const optionsButton = await screen.findByLabelText('More options');
    fireEvent.click(optionsButton);
    await screen.findByText('Report');
    const downvote = await screen.findByLabelText('Downvote');
    fireEvent.click(downvote);
    await new Promise(process.nextTick);
    expect(await screen.findByText('5 Upvotes')).toBeInTheDocument();
  });
});
