import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import defaultPost, { sharePost } from '../../../../../__tests__/fixture/post';
import type { Post } from '../../../../graphql/posts';
import { useConditionalFeature } from '../../../../hooks/useConditionalFeature';
import { featureListCardTldr } from '../../../../lib/featureManagement';
import { CardTldr } from './CardTldr';

jest.mock('../../../../hooks/useConditionalFeature');

const mockUseConditionalFeature = jest.mocked(useConditionalFeature);
const summary = 'Go 1.27 drains unread HTTP/1 response bodies for you.';
const post: Post = { ...defaultPost, summary };

const setTreatment = (isEnabled: boolean) =>
  mockUseConditionalFeature.mockReturnValue({
    value: isEnabled,
    isLoading: false,
  } as ReturnType<typeof useConditionalFeature>);

// jsdom does no layout, so a clamped paragraph never reports overflow on its own.
const mockTextHeights = (scrollHeight: number, clientHeight: number) => {
  jest
    .spyOn(Element.prototype, 'scrollHeight', 'get')
    .mockReturnValue(scrollHeight);
  jest
    .spyOn(Element.prototype, 'clientHeight', 'get')
    .mockReturnValue(clientHeight);
};

beforeEach(() => {
  jest.restoreAllMocks();
  mockUseConditionalFeature.mockReset();
});

describe('CardTldr', () => {
  it('renders nothing in the control arm', () => {
    setTreatment(false);
    const { container } = render(<CardTldr post={post} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('only enrolls readers when there is a TLDR to show', () => {
    setTreatment(false);
    render(<CardTldr post={{ ...post, summary: '' }} />);

    expect(mockUseConditionalFeature).toHaveBeenCalledWith({
      feature: featureListCardTldr,
      shouldEvaluate: false,
    });
  });

  it('shows the TLDR without "Show more" when it fits', () => {
    setTreatment(true);
    mockTextHeights(40, 40);
    render(<CardTldr post={post} />);

    expect(screen.getByText(summary)).toBeInTheDocument();
    expect(screen.queryByText('Show more')).not.toBeInTheDocument();
  });

  it('expands a clamped TLDR in place for good', () => {
    setTreatment(true);
    mockTextHeights(120, 60);
    const onExpand = jest.fn();
    render(<CardTldr post={post} onExpand={onExpand} />);

    const text = screen.getByText(summary);
    expect(text).toHaveClass('line-clamp-3');

    fireEvent.click(screen.getByRole('button', { name: 'Show more' }));
    expect(text).not.toHaveClass('line-clamp-3');
    expect(onExpand).toHaveBeenCalledWith(post);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it("shows a share's TLDR from the post it shares", () => {
    setTreatment(true);
    render(<CardTldr post={sharePost} />);

    expect(
      screen.getByText(sharePost.sharedPost?.summary?.trim() as string),
    ).toBeInTheDocument();
  });
});
