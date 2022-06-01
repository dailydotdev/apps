import { render, RenderResult, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { AnonymousUser, LoggedUser } from '../../lib/user';
import SubmitArticle from './SubmitArticle';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { SUBMIT_ARTICLE_MUTATION } from '../../graphql/submitArticle';

const onRequestClose = jest.fn();

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const defaultUser: LoggedUser = {
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '2020-07-26T13:04:35.000Z',
  username: 'test',
  permalink: 'sample',
};

const renderComponent = (
  isEnabled = false,
  user: LoggedUser | AnonymousUser = defaultUser,
): RenderResult => {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={user}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
      >
        <SubmitArticle
          headerCopy="Submit article"
          submitArticleModalButton="Submit article"
          isEnabled={isEnabled}
          isOpen
          onRequestClose={onRequestClose}
        />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should show request access for certain users', async () => {
  renderComponent();
  expect(await screen.findByLabelText('Request access')).toBeInTheDocument();
});

it('should show a message no URL was set', async () => {
  renderComponent(true);
  const btn = await screen.findByLabelText('Submit article');
  btn.click();
  expect(
    await screen.findByText('Please submit a valid URL'),
  ).toBeInTheDocument();
});

it('should disable the button on invalid URL', async () => {
  renderComponent(true);
  const input = await screen.findByRole('textbox');
  userEvent.type(input, 'fakeURL');
  const btn = await screen.findByLabelText('Submit article');
  expect(btn).toBeDisabled();
});

it('should submit a valid URL', async () => {
  renderComponent(true);
  const input = await screen.findByRole('textbox');
  userEvent.type(input, 'http://blog.daily.dev/blog/article-1');
  const btn = await screen.findByLabelText('Submit article');
  btn.click();

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

  expect(await screen.findByText('Request sent')).toBeInTheDocument();
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
  renderComponent(true);
  await act(async () => {
    const input = await screen.findByRole('textbox');
    userEvent.type(input, 'http://blog.daily.dev/blog/article-1');
    const btn = await screen.findByLabelText('Submit article');
    btn.click();
  });
  await screen.findAllByRole('button');
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
  renderComponent(true);
  const input = await screen.findByRole('textbox');
  userEvent.type(input, 'http://blog.daily.dev/blog/article-1');
  const btn = await screen.findByLabelText('Submit article');
  btn.click();

  expect(
    await screen.findByText(
      'Article has been submitted already! Current status: NOT_STARTED',
    ),
  ).toBeInTheDocument();
});
