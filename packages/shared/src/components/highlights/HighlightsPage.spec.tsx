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
      data: {
        majorHeadlines: {
          edges: [],
        },
        channelConfigurations: [
          {
            channel: 'vibes',
            displayName: 'Agentic',
          },
        ],
      },
      isFetching: false,
    });

    render(<HighlightsPage />);

    expect(screen.getByRole('link', { name: 'Agentic' })).toHaveAttribute(
      'href',
      '/highlights/agentic',
    );
  });
});
