import React from 'react';
import { render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { HighlightsPage } from './HighlightsPage';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockUseQuery = useQuery as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe('HighlightsPage', () => {
  const highlightsPageData = {
    majorHeadlines: {
      edges: [],
    },
    channelConfigurations: [
      {
        channel: 'vibes',
        displayName: 'Agentic',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      pathname: '/highlights',
      query: {},
      push: jest.fn(),
    });
  });

  it('should use the agentic alias for the vibes channel tab URL', () => {
    mockUseQuery.mockReturnValue({
      data: highlightsPageData,
      isFetching: false,
    });

    render(<HighlightsPage />);

    expect(screen.getByRole('link', { name: 'Agentic' })).toHaveAttribute(
      'href',
      '/highlights/agentic',
    );
  });

  it('should keep the agentic tab selected for the alias route', () => {
    mockUseRouter.mockReturnValue({
      pathname: '/highlights/[channel]',
      query: { channel: 'agentic' },
      push: jest.fn(),
    });
    mockUseQuery.mockReturnValue({
      data: highlightsPageData,
      isFetching: false,
    });

    render(<HighlightsPage />);

    expect(screen.getByText('Agentic')).toHaveClass('bg-theme-active');
  });
});
