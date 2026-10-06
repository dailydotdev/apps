import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { useInView } from 'react-intersection-observer';
import nock from 'nock';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import post from '../../../__tests__/fixture/post';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { AuthContextData } from '../../contexts/AuthContext';
import { TAG_TITLES_QUERY } from '../../graphql/keywords';
import { POST_TOPIC_SIGNUP_QUERY } from '../../graphql/postTopicSignup';
import { AuthTriggers } from '../../lib/auth';
import { AuthDisplay } from '../auth/common';
import { PostSignupWidget } from './PostSignupWidget';

jest.mock('react-intersection-observer', () => ({
  ...jest.requireActual('react-intersection-observer'),
  useInView: jest.fn(),
}));

jest.mock('../auth/AuthOptions', () => ({
  __esModule: true,
  default: ({
    onAuthStateUpdate,
  }: {
    onAuthStateUpdate: (props: { defaultDisplay: string }) => void;
  }) => {
    const { AuthDisplay: Display } = jest.requireActual('../auth/common');
    return (
      <button
        type="button"
        onClick={() =>
          onAuthStateUpdate({ defaultDisplay: Display.Registration })
        }
      >
        Continue with email
      </button>
    );
  },
}));

const mockUseInView = useInView as jest.Mock;
const showLogin = jest.fn();
const examplePost = {
  ...post,
  id: 'related-post',
  title: 'A practical web development guide',
  commentsPermalink: '/posts/related-post',
};

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  mockUseInView.mockReturnValue([jest.fn(), true]);
});

const renderWidget = ({
  topicEnabled = true,
  genericEnabled = true,
  inline = true,
  currentPost = post,
  auth = {},
}: {
  topicEnabled?: boolean;
  genericEnabled?: boolean;
  inline?: boolean;
  currentPost?: typeof post;
  auth?: Partial<AuthContextData>;
} = {}) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const gb = new GrowthBook({
    features: {
      post_topic_signup: { defaultValue: topicEnabled },
      post_signup_widget: { defaultValue: genericEnabled },
    },
  });

  return render(
    <TestBootProvider
      client={client}
      gb={gb}
      auth={{ isLoggedIn: false, showLogin, ...auth }}
    >
      <PostSignupWidget post={currentPost} inline={inline} />
    </TestBootProvider>,
  );
};

const mockPreviews = (currentPost = post, fail = false) => {
  mockGraphQL({
    request: { query: TAG_TITLES_QUERY },
    result: {
      data: {
        tags: [{ value: 'webdev', flags: { title: 'Web Development' } }],
      },
    },
  });
  mockGraphQL({
    request: {
      query: POST_TOPIC_SIGNUP_QUERY,
      variables: { post: currentPost.id, tag: 'webdev', first: 2 },
    },
    result: fail
      ? { errors: [{ message: 'Preview unavailable' }] }
      : { data: { similarPosts: [examplePost] } },
  });
};

it('keeps the existing sidebar offer when the topic experiment is off', () => {
  renderWidget({ topicEnabled: false, inline: false });
  expect(screen.getByText('Want your personalized dev feed?')).toBeVisible();
  expect(mockUseInView).not.toHaveBeenCalled();
});

it('does not add an inline offer to the control', () => {
  renderWidget({ topicEnabled: false });
  expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  expect(mockUseInView).not.toHaveBeenCalled();
});

it.each([{ user: loggedUser }, { isAuthReady: false }])(
  'does not show or fetch an offer for an ineligible visitor: %j',
  (auth) => {
    renderWidget({ auth });
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(mockUseInView).not.toHaveBeenCalled();
  },
);

it('avoids a second signup card in the sidebar during the experiment', () => {
  renderWidget({ inline: false });
  expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  expect(mockUseInView).not.toHaveBeenCalled();
});

it('falls back to the existing offer for posts without topics', () => {
  renderWidget({ inline: false, currentPost: { ...post, tags: [] } });
  expect(screen.getByText('Want your personalized dev feed?')).toBeVisible();
});

it('uses the raw topic before it is visible without fetching previews', () => {
  mockUseInView.mockReturnValue([jest.fn(), false]);
  mockPreviews();
  renderWidget();
  expect(screen.getByText('Get more posts about #webdev')).toBeVisible();
  expect(nock.pendingMocks()).toHaveLength(2);
});

it('shows backend topic titles and public previews while preserving signup', async () => {
  mockPreviews();
  renderWidget();
  expect(
    await screen.findByText('Get more posts about Web Development'),
  ).toBeVisible();
  expect(
    await screen.findByRole('link', { name: /practical web/ }),
  ).toHaveAttribute('href', examplePost.commentsPermalink);
  fireEvent.click(screen.getByRole('button', { name: 'Continue with email' }));
  expect(showLogin).toHaveBeenCalledWith({
    trigger: AuthTriggers.PostPage,
    options: {
      isLogin: false,
      defaultDisplay: AuthDisplay.Registration,
      formValues: undefined,
    },
  });
});

it('uses the underlying article topic on shared posts', async () => {
  mockPreviews();
  renderWidget({
    currentPost: {
      ...post,
      id: 'share',
      tags: [],
      sharedPost: { ...post, title: 'Shared article', image: '/article.png' },
    },
  });
  expect(
    await screen.findByRole('link', { name: /practical web/ }),
  ).toBeVisible();
  await waitFor(() => expect(nock.isDone()).toBe(true));
});

it('keeps signup usable when recommendations fail', async () => {
  mockPreviews(post, true);
  renderWidget();
  await waitFor(() => expect(nock.isDone()).toBe(true));
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Continue with email' }),
  ).toBeEnabled();
});
