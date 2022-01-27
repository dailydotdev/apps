import React from 'react';
import { subDays } from 'date-fns';
import { render, screen } from '@testing-library/react';
import nock from 'nock';
import ReadingHistoryItem from './ReadingHistoryItem';
import ReadHistoryList, { ReadHistoryListProps } from './ReadingHistoryList';
import { ReadHistoryInfiniteData } from '../../hooks/useInfiniteReadingHistory';

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

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

  it('should show date section for reads today', async () => {
    render(<ReadHistoryList {...props} />);
    await screen.findByText('Today');
  });

  it('should show date section for reads yesterday', async () => {
    render(<ReadHistoryList {...props} />);
    await screen.findByText('Yesterday');
  });

  it('should show date section for reads of the same year', async () => {
    const year = new Date().getFullYear();
    const date = new Date(`${year}-03-31 07:15:51.247`);
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
      date.getDay()
    ];
    render(<ReadHistoryList {...props} />);
    await screen.findByText(`${weekday}, 31 Mar`);
  });

  it('should show date section for reads of the different year', async () => {
    render(<ReadHistoryList {...props} />);
    await screen.findByText('Sat, 31 Mar 2018');
  });
});

describe('ReadingHistoryItem component', () => {
  const onHide = jest.fn();
  const createdAt = new Date('202-10-22T07:15:51.247Z');
  const defaultHistory = {
    timestamp: createdAt,
    timestamp_db: createdAt,
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
    const btn = await screen.findByRole('button');
    btn.click();
    expect(onHide).toHaveBeenCalledWith({
      postId: defaultHistory.post.id,
      timestamp: defaultHistory.timestamp,
    });
  });
});
