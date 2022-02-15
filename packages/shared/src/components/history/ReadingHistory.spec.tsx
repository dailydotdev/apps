import React from 'react';
import { subDays } from 'date-fns';
import {
  act,
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import ReadingHistoryItem from './ReadingHistoryItem';
import ReadHistoryList, { ReadHistoryListProps } from './ReadingHistoryList';
import { ReadHistoryInfiniteData } from '../../hooks/useInfiniteReadingHistory';
import AuthContext from '../../contexts/AuthContext';
import user from '../../../__tests__/fixture/loggedUser';
import PostOptionsReadingHistoryMenu from '../PostOptionsReadingHistoryMenu';

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const defaultUser = {
  id: 'u1',
  username: 'idoshamun',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '2020-07-26T13:04:35.000Z',
};

describe('ReadingHistoryList component', () => {
  const createdAtToday = new Date();
  const createdAtYesterday = subDays(createdAtToday, 1);
  const currentYear = createdAtToday.getFullYear();
  const createdThisYear = new Date(`${currentYear}-03-31 07:15:51.247`);
  const createdAtDifferentYear = new Date('2018-03-31 07:15:51.247');
  const timestamps = [
    createdAtToday,
    createdAtYesterday,
    createdThisYear,
    createdAtDifferentYear,
  ];
  const post = {
    id: 'p1',
    title: 'Most Recent Post',
    commentsPermalink: 'most.recent.post.url',
    image: 'most.recent.post.image',
    source: {
      image: 'most.recent.post.source.image',
    },
  };
  const defaultReadingHistory: ReadHistoryInfiniteData = {
    pages: [
      {
        readHistory: {
          pageInfo: { hasNextPage: true, endCursor: '' },
          edges: timestamps.map((timestamp) => ({
            node: { timestamp, post },
          })),
        },
      },
    ],
    pageParams: [],
  };
  const onHide = jest.fn();
  const infiniteScrollRef = jest.fn();
  const props: ReadHistoryListProps = {
    data: defaultReadingHistory,
    infiniteScrollRef,
    onHide,
  };

  const renderComponent = (): RenderResult => {
    const client = new QueryClient();

    return render(
      <QueryClientProvider client={client}>
        <AuthContext.Provider
          value={{
            user: { ...defaultUser, ...user },
            shouldShowLogin: false,
            showLogin: jest.fn(),
            updateUser: jest.fn(),
            tokenRefreshed: true,
          }}
        >
          <ReadHistoryList {...props} />
        </AuthContext.Provider>
      </QueryClientProvider>,
    );
  };

  it('should show date section for reads today', async () => {
    renderComponent();
    await screen.findByText('Today');
  });

  it('should show date section for reads yesterday', async () => {
    renderComponent();
    await screen.findByText('Yesterday');
  });

  it('should show date section for reads of the same year', async () => {
    const year = new Date().getFullYear();
    const date = new Date(`${year}-03-31 07:15:51.247`);
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
      date.getDay()
    ];
    renderComponent();
    await screen.findByText(`${weekday}, 31 Mar`);
  });

  it('should show date section for reads of the different year', async () => {
    renderComponent();
    await screen.findByText('Sat, 31 Mar 2018');
  });
});

describe('ReadingHistoryItem component', () => {
  const onHide = jest.fn();
  const onContextMenu = jest.fn();
  const setReadingHistoryContextItem = jest.fn();

  const createdAt = new Date('202-10-22T07:15:51.247Z');
  const defaultHistory = {
    timestamp: createdAt,
    timestampDb: createdAt,
    post: {
      id: 'p1',
      title: 'Most Recent Post',
      commentsPermalink: 'most.recent.post.url',
      image: 'most.recent.post.image',
      source: {
        image: 'most.recent.post.source.image',
      },
    },
  };

  it('should show view history post title', async () => {
    render(<ReadingHistoryItem history={defaultHistory} />);
    await screen.findByText(defaultHistory.post.title);
  });

  it('should show view history post image', async () => {
    render(<ReadingHistoryItem history={defaultHistory} />);
    await screen.findByAltText(defaultHistory.post.title);
  });

  it('should show view history post source image', async () => {
    render(<ReadingHistoryItem history={defaultHistory} />);
    await screen.findByAltText(`source of ${defaultHistory.post.title}`);
  });

  it('should call onHide on close button clicked', async () => {
    render(<ReadingHistoryItem history={defaultHistory} onHide={onHide} />);
    const button = (await screen.findAllByRole('button'))[0];
    fireEvent.click(button);
    expect(onHide).toHaveBeenCalledWith({
      postId: defaultHistory.post.id,
      timestamp: defaultHistory.timestamp,
    });
  });

  it('should call onContextMenu on menu button clicked', async () => {
    render(
      <ReadingHistoryItem
        history={defaultHistory}
        onHide={onHide}
        onContextMenu={onContextMenu}
      />,
    );
    const button = (await screen.findAllByRole('button'))[1];
    fireEvent.click(button);
    expect(onContextMenu).toHaveBeenCalledTimes(1);
  });
});
