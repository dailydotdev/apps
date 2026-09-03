import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { BriefShareBand } from './BriefShareBand';
import type { Post } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';

let mockIsEnabled = false;

jest.mock('../../snapshot/useSharePlacement', () => ({
  useSharePlacement: () => mockIsEnabled,
}));

const post = { id: 'brief-1', slug: 'brief-1' } as Post;

const renderComponent = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <BriefShareBand origin={Origin.BriefPage} post={post} />
    </TestBootProvider>,
  );

describe('BriefShareBand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsEnabled = false;
  });

  it('renders nothing while the placement is off', () => {
    const { container } = renderComponent();

    expect(container).toBeEmptyDOMElement();
  });

  it('offers the brief link on the shared band when the placement is on', () => {
    mockIsEnabled = true;
    renderComponent();

    expect(screen.getByText('Share your briefing')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy link' }),
    ).toBeInTheDocument();
  });
});
