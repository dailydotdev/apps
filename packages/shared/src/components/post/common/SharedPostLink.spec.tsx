import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import post from '../../../../__tests__/fixture/post';
import type { SharedPost } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { combinedClicks } from '../../../lib/click';
import { SharedPostLink } from './SharedPostLink';

const mockReaderGate = jest.fn();
const sharedPost: SharedPost = { ...post, title: 'An article' };

jest.mock('../../../hooks/useReaderInstallPromptGate', () => ({
  useReaderInstallPromptGate: () => ({ onReadClick: mockReaderGate }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockReaderGate.mockReturnValue(false);
  window.getSelection()?.removeAllRanges();
});

it.each(['tds', 'unknown'])(
  'opens the source article and records the read for source %s',
  (sourceId) => {
    const onRead = jest.fn();
    render(
      <SharedPostLink
        sharedPost={{
          ...sharedPost,
          source: { ...post.source!, id: sourceId },
        }}
        source={post.source}
        onGoToLinkProps={combinedClicks(onRead)}
      >
        Read original
      </SharedPostLink>,
    );
    const link = screen.getByRole('link', { name: 'Read original' });
    expect(link).toHaveAttribute('href', post.permalink);
    expect(link).toHaveAttribute('target', '_blank');

    fireEvent.click(link);

    expect(onRead).toHaveBeenCalledTimes(1);
  },
);

it.each([
  PostType.Freeform,
  PostType.Collection,
  PostType.Poll,
  PostType.Brief,
  PostType.Digest,
])(
  'keeps a shared %s post inside daily.dev even with an unknown source',
  (type) => {
    const onRead = jest.fn();
    mockReaderGate.mockReturnValue(true);
    render(
      <SharedPostLink
        sharedPost={{
          ...sharedPost,
          type,
          source: { ...post.source!, id: 'unknown' },
        }}
        source={post.source}
        onGoToLinkProps={combinedClicks(onRead)}
      >
        Read original
      </SharedPostLink>,
    );
    const link = screen.getByRole('link', { name: 'Read original' });
    expect(link).toHaveAttribute('href', post.commentsPermalink);
    expect(link).not.toHaveAttribute('target', '_blank');

    fireEvent.click(link);

    expect(mockReaderGate).not.toHaveBeenCalled();
    expect(onRead).not.toHaveBeenCalled();
  },
);

it('lets the reader gate handle article reads before recording the read', () => {
  const onRead = jest.fn();
  mockReaderGate.mockImplementation((event: React.MouseEvent) => {
    event.preventDefault();
    return true;
  });
  render(
    <SharedPostLink
      sharedPost={sharedPost}
      source={post.source}
      onGoToLinkProps={combinedClicks(onRead)}
    >
      Read original
    </SharedPostLink>,
  );

  expect(fireEvent.click(screen.getByRole('link'))).toBe(false);
  expect(onRead).not.toHaveBeenCalled();
});

it('records middle-click reads once', () => {
  const onRead = jest.fn();
  render(
    <SharedPostLink
      sharedPost={sharedPost}
      source={post.source}
      onGoToLinkProps={combinedClicks(onRead)}
    >
      Read original
    </SharedPostLink>,
  );

  fireEvent(
    screen.getByRole('link'),
    new MouseEvent('auxclick', { bubbles: true, button: 1 }),
  );
  expect(onRead).toHaveBeenCalledTimes(1);
});
