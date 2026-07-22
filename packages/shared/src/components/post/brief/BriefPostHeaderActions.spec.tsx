import React from 'react';
import type { RenderResult } from '@testing-library/react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { BriefPostHeaderActions } from './BriefPostHeaderActions';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { Post } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';
import { useViewSize } from '../../../hooks/useViewSize';

const mockUseShareBriefingDigest = jest.fn();
const mockCopyLink = jest.fn();
const share = jest.fn().mockResolvedValue(undefined);
const writeText = jest.fn().mockResolvedValue(undefined);

jest.mock('../../../hooks/useShareBriefingDigest', () => ({
  useShareBriefingDigest: () => mockUseShareBriefingDigest(),
}));

jest.mock('../../../hooks/useSharePost', () => ({
  useSharePost: () => ({ copyLink: mockCopyLink }),
}));

jest.mock('../../../hooks/useViewSize', () => {
  const actual = jest.requireActual('../../../hooks/useViewSize');
  return { __esModule: true, ...actual, useViewSize: jest.fn() };
});

const useViewSizeMock = useViewSize as jest.Mock;

const post = {
  id: 'brief-1',
  title: 'Presidential briefing',
  summary: 'Rust 1.90 lands async closures.',
  commentsPermalink: 'https://app.daily.dev/posts/brief-1',
} as Post;

// Mirrors how BriefPostContent renders the header (share always requested) and
// how DigestPostContent renders it (share requested only behind the gate).
const renderBrief = (): RenderResult =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <BriefPostHeaderActions
        post={post}
        origin={Origin.BriefModal}
        contextMenuId="post-widgets-context"
        showShareButton
      />
    </TestBootProvider>,
  );

const renderDigest = (): RenderResult =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <BriefPostHeaderActions
        post={post}
        origin={Origin.BriefModal}
        contextMenuId="post-widgets-context"
        showShareButton={mockUseShareBriefingDigest()}
      />
    </TestBootProvider>,
  );

describe('BriefPostHeaderActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useViewSizeMock.mockReturnValue(true);
    mockUseShareBriefingDigest.mockReturnValue(false);
    Object.assign(navigator, { clipboard: { writeText } });
  });

  describe('with the share gate off', () => {
    it('keeps the legacy copy-link button on the brief', () => {
      renderBrief();

      fireEvent.click(screen.getByLabelText('Copy link'));

      expect(mockCopyLink).toHaveBeenCalledWith({ post });
      expect(screen.queryByLabelText('Share briefing')).not.toBeInTheDocument();
    });

    it('leaves the digest post with no share affordance at all', () => {
      renderDigest();

      expect(screen.queryByLabelText('Copy link')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Share briefing')).not.toBeInTheDocument();
    });
  });

  describe('with the share gate on', () => {
    beforeEach(() => mockUseShareBriefingDigest.mockReturnValue(true));

    it('gives the brief the share popover instead of the legacy button', () => {
      renderBrief();

      expect(screen.getByLabelText('Share briefing')).toBeInTheDocument();
      expect(screen.queryByLabelText('Copy link')).not.toBeInTheDocument();
    });

    it('gives the digest post the same share affordance as the brief', () => {
      renderDigest();

      expect(screen.getByLabelText('Share briefing')).toBeInTheDocument();
    });

    it('taps straight through to the native share sheet on mobile', async () => {
      useViewSizeMock.mockReturnValue(false);
      Object.assign(navigator, { share, maxTouchPoints: 5 });

      renderDigest();

      await act(async () => {
        fireEvent.click(screen.getByLabelText('Share briefing'));
      });

      await waitFor(() => expect(share).toHaveBeenCalled());
      expect(writeText).not.toHaveBeenCalled();
    });
  });
});
