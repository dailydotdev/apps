import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import nock from 'nock';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { AnonymousUser, LoggedUser } from '../../lib/user';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import {
  SUBMISSION_AVAILABILITY_QUERY,
  SUBMIT_ARTICLE_MUTATION,
} from '../../graphql/submitArticle';
import SubmitArticleModal from './SubmitArticleModal';
import user from '../../../__tests__/fixture/loggedUser';
import { NotificationsContextProvider } from '../../contexts/NotificationsContext';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import Toast from '../notifications/Toast';

const onRequestClose = jest.fn();

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const createSubmissionAvailabilityMock = (
  submissionAvailability = {
    hasAccess: true,
    limit: 3,
    todaySubmissionsCount: 0,
  },
) => ({
  request: { query: SUBMISSION_AVAILABILITY_QUERY },
  result: { data: { submissionAvailability } },
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createSubmissionAvailabilityMock()],
  userUpdate: LoggedUser | AnonymousUser = user,
): RenderResult => {
  const client = new QueryClient();
  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={userUpdate}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
      >
        <NotificationsContextProvider>
          <Toast />
          <SubmitArticleModal isOpen onRequestClose={onRequestClose} />
        </NotificationsContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should disable the button on invalid URL', async () => {
  renderComponent();
  const input = await screen.findByRole('textbox');
  userEvent.type(input, 'fakeURL');
  const btn = await screen.findByLabelText('Submit');
  expect(btn).toBeDisabled();
});

it('should submit a valid URL', async () => {
  renderComponent();
  const link = 'http://blog.daily.dev/blog/article-1';
  const input = (await screen.findByRole('textbox')) as HTMLInputElement;
  userEvent.type(input, link);
  input.value = link;
  const btn = await screen.findByLabelText('Submit');
  await waitFor(() => expect(btn).toBeEnabled());
  fireEvent.click(btn);

  mockGraphQL({
    request: {
      query: SUBMIT_ARTICLE_MUTATION,
      variables: { url: 'http://blog.daily.dev/blog/article-1' },
    },
    result: {
      data: {
        submitArticle: {
          submission: {
            id: 1,
          },
        },
      },
    },
  });

  const sent = 'We will notify you about the post-submission status via email';
  await waitFor(() => {
    const element = screen.getByText(sent);
    expect(element).toBeInTheDocument();
  });
});

it('should feedback existing article', async () => {
  let mutationCalled = false;
  mockGraphQL({
    request: {
      query: SUBMIT_ARTICLE_MUTATION,
      variables: { url: 'http://blog.daily.dev/blog/article-1' },
    },
    result: () => {
      mutationCalled = true;
      return {
        data: {
          submitArticle: {
            reason: 'test',
            post: {
              id: '--_O4aDWx',
              shortId: '--_O4aDWx',
              publishedAt: '2021-05-15T15:00:00.000Z',
              createdAt: '2021-05-15T15:06:04.000Z',
              metadataChangedAt: '2021-10-08T07:13:56.460Z',
              sourceId: '40f4a18f3bb54009a7337acc75b6fb1a',
              url: 'https://www.theverge.com/2021/5/15/22434809/internet-broadband-high-speed-access-verge-stories-infrastructure',
              canonicalUrl:
                'https://www.theverge.com/2021/5/15/22434809/internet-broadband-high-speed-access-verge-stories-infrastructure',
              title: 'Test article title',
              image:
                'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/99193389438bf365e5b3739d316d4499',
              ratio: 1.91082802547771,
              placeholder:
                'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAFAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMG/8QAHhAAAgICAgMAAAAAAAAAAAAAAQQCAwAREiEFMUH/xAAVAQEBAAAAAAAAAAAAAAAAAAAFB//EAB0RAAEEAgMAAAAAAAAAAAAAAAEAAgMRBDEFIVH/2gAMAwEAAhEDEQA/AMzWky15yFyz00KpLwtNKsOETMniSe/uhsDQ6y7UqQ1cCvEkTOz633jGJyuJoHwKrcFAyPMyWs6AOrNbK//Z',
              tweeted: false,
              views: 0,
              score: 27018186,
              siteTwitter: '',
              creatorTwitter: '',
              readTime: 7,
              tagsStr: '',
              upvotes: 0,
              comments: 0,
              scoutId: null,
              authorId: null,
              sentAnalyticsReport: true,
              viewsThreshold: 0,
              trending: null,
              lastTrending: null,
              discussionScore: null,
              banned: false,
              deleted: false,
              description: null,
              toc: null,
              summary: null,
              __source__: {
                id: '40f4a18f3bb54009a7337acc75b6fb1a',
                twitter: '',
                website: '',
                active: false,
                rankBoost: 22,
                name: 'The Verge',
                image:
                  'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395351/android-chrome-192x192.0.png',
                private: true,
                advancedSettings: [],
              },
              source: {
                id: '40f4a18f3bb54009a7337acc75b6fb1a',
                twitter: '',
                website: '',
                active: false,
                rankBoost: 22,
                name: 'The Verge',
                image:
                  'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395351/android-chrome-192x192.0.png',
                private: true,
                advancedSettings: [],
              },
              commentsPermalink: 'http://localhost:5002/posts/--_O4aDWx',
            },
          },
        },
      };
    },
  });
  renderComponent();
  const link = 'http://blog.daily.dev/blog/article-1';
  const input = (await screen.findByRole('textbox')) as HTMLInputElement;
  userEvent.type(input, link);
  input.value = link;
  const btn = await screen.findByLabelText('Submit');
  await waitFor(() => expect(btn).toBeEnabled());
  btn.click();
  // Wait for promise to resolve
  await new Promise((resolve) => setTimeout(resolve, 10));
  await waitForNock();
  expect(mutationCalled).toBeTruthy();
  expect(await screen.findByText('Article exists')).toBeInTheDocument();
  expect(await screen.findByText('Test article title')).toBeInTheDocument();
});

it('should feedback already submitted article', async () => {
  mockGraphQL({
    request: {
      query: SUBMIT_ARTICLE_MUTATION,
      variables: { url: 'http://blog.daily.dev/blog/article-1' },
    },
    result: {
      data: {
        submitArticle: {
          reason:
            'Article has been submitted already! Current status: NOT_STARTED',
        },
      },
    },
  });
  renderComponent();
  const link = 'http://blog.daily.dev/blog/article-1';
  const input = (await screen.findByRole('textbox')) as HTMLInputElement;
  userEvent.type(input, link);
  input.value = link;
  const btn = await screen.findByLabelText('Submit');
  await waitFor(() => expect(btn).toBeEnabled());
  btn.click();

  expect(
    await screen.findByText(
      'Article has been submitted already! Current status: NOT_STARTED',
    ),
  ).toBeInTheDocument();
});

it('should feedback submitted article is deleted', async () => {
  mockGraphQL({
    request: {
      query: SUBMIT_ARTICLE_MUTATION,
      variables: { url: 'http://blog.daily.dev/blog/article-1' },
    },
    result: {
      data: {
        submitArticle: {
          result: 'reject',
          reason: 'post is deleted',
        },
      },
    },
  });
  renderComponent();
  const link = 'http://blog.daily.dev/blog/article-1';
  const input = (await screen.findByRole('textbox')) as HTMLInputElement;
  userEvent.type(input, link);
  input.value = link;
  const btn = await screen.findByLabelText('Submit');
  await waitFor(() => expect(btn).toBeEnabled());
  btn.click();

  expect(await screen.findByText('post is deleted')).toBeInTheDocument();
});
