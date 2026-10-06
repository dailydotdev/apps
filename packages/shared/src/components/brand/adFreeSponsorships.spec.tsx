import type { ReactElement } from 'react';
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { defaultQueryClientTestingConfig } from '../../../__tests__/helpers/tanstack-query';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import defaultPost from '../../../__tests__/fixture/post';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import type { EngagementCreative } from '../../lib/engagementAds';
import { EngagementAdsProvider } from '../../contexts/EngagementAdsContext';
import { ActivePostContextProvider } from '../../contexts/ActivePostContext';
import { PostTagList } from '../post/tags/PostTagList';
import { PostActions } from '../post/PostActions';
import ShowMoreContent from '../cards/common/ShowMoreContent';
import { MentionedToolsWidget } from './MentionedToolsWidget';

jest.mock('../../features/profile/hooks/useUserStack', () => ({
  useUserStack: jest.fn(() => ({
    stackItems: [],
    add: jest.fn(),
    remove: jest.fn(),
  })),
}));

const creative: EngagementCreative = {
  gen_id: 'c1',
  promoted_name: 'Copilot',
  promoted_body: 'AI pair programming',
  promoted_cta: 'Try free',
  promoted_url: 'https://example.com',
  promoted_logo_img: {
    dark: 'https://example.com/logo-dark.png',
    light: 'https://example.com/logo-light.png',
  },
  promoted_icon_img: {
    dark: 'https://example.com/icon-dark.png',
    light: 'https://example.com/icon-light.png',
  },
  promoted_gradient_start: { dark: '#000', light: '#fff' },
  promoted_gradient_end: { dark: '#111', light: '#eee' },
  tools: ['VSCode'],
  keywords: ['Copilot'],
  tags: ['ai'],
};

const regularPost: Post = {
  ...defaultPost,
  tags: ['ai', 'react'],
  userState: { vote: UserVote.None },
};

const adFreePost: Post = {
  ...regularPost,
  source: {
    ...defaultPost.source,
    features: { verified: true, adFree: true, links: false, products: false },
  } as Post['source'],
};

const wrap = (post: Post, ui: ReactElement) => (
  <TestBootProvider
    client={new QueryClient(defaultQueryClientTestingConfig)}
    auth={{ user: loggedUser }}
  >
    <EngagementAdsProvider rawCreatives={[creative]}>
      <ActivePostContextProvider post={post}>{ui}</ActivePostContextProvider>
    </EngagementAdsProvider>
  </TestBootProvider>
);

const cases = [
  ['shown for a regular source', regularPost, true],
  ['hidden for an ad-free squad', adFreePost, false],
] as const;

describe('brand sponsorships on a post', () => {
  it.each(cases)(
    'sponsored tag branding is %s, the plain tags stay',
    (_, post, isShown) => {
      render(wrap(post, <PostTagList post={post} />));

      const list = screen.getByRole('list', { name: 'Post tags' });
      expect(list).toHaveTextContent('react');
      expect(list).toHaveTextContent('ai');
      expect(screen.queryAllByText(/sponsored by Copilot/).length > 0).toBe(
        isShown,
      );
    },
  );

  it.each(cases)(
    'the sponsored keyword highlight in the summary is %s',
    (_, post, isShown) => {
      render(
        wrap(post, <ShowMoreContent content="Try Copilot for AI coding" />),
      );

      expect(screen.getByTestId('tldr-container')).toHaveTextContent(
        'Try Copilot for AI coding',
      );
      expect(!!screen.queryByText('Copilot', { selector: 'span' })).toBe(
        isShown,
      );
    },
  );

  it.each(cases)('the sponsored tools widget is %s', (_, post, isShown) => {
    render(wrap(post, <MentionedToolsWidget postTags={post.tags ?? []} />));

    expect(!!screen.queryByText('Sponsored tools')).toBe(isShown);
  });

  it.each(cases)('the branded upvote animation is %s', (_, post, isShown) => {
    const { rerender, container } = render(
      wrap(post, <PostActions post={post} postQueryKey={['post']} />),
    );
    const upvoted = { ...post, userState: { vote: UserVote.Up } };
    rerender(
      wrap(upvoted, <PostActions post={upvoted} postQueryKey={['post']} />),
    );

    // The particle canvas has no role; it mounts only for a branded upvote.
    // eslint-disable-next-line testing-library/no-container
    expect(!!container.querySelector('canvas')).toBe(isShown);
  });
});
