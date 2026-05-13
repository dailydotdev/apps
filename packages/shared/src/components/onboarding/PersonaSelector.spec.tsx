import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersonaSelector } from './PersonaSelector';
import {
  broadcastPersonaSelection,
  broadcastRecommendRequest,
} from './onboardingPopBus';

jest.mock('./onboardingPopBus', () => {
  const actual = jest.requireActual('./onboardingPopBus');
  return {
    ...actual,
    broadcastPersonaSelection: jest.fn(actual.broadcastPersonaSelection),
    broadcastRecommendRequest: jest.fn(actual.broadcastRecommendRequest),
  };
});

const mockOnFollowTags = jest.fn().mockResolvedValue({ successful: true });
const mockOnUnfollowTags = jest.fn().mockResolvedValue({ successful: true });
const mockLogEvent = jest.fn();
const mockRequest = jest.fn();

jest.mock('../../graphql/common', () => ({
  gqlClient: { request: (...args: unknown[]) => mockRequest(...args) },
}));

jest.mock('../../hooks/useTagAndSource', () => ({
  __esModule: true,
  default: () => ({
    onFollowTags: mockOnFollowTags,
    onUnfollowTags: mockOnUnfollowTags,
  }),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

const personas = [
  { id: 'frontend', title: 'Frontend', emoji: '🌐', tags: ['react', 'css'] },
  { id: 'backend', title: 'Backend', emoji: '🖥️', tags: ['node', 'sql'] },
  { id: 'mobile', title: 'Mobile', emoji: '📱', tags: ['ios', 'android'] },
  { id: 'devops', title: 'DevOps', emoji: '☁️', tags: ['docker', 'k8s'] },
];

const renderComponent = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <PersonaSelector />
    </QueryClientProvider>,
  );
};

describe('PersonaSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue({ onboardingPersonas: personas });
  });

  it('renders pills with emoji and title', async () => {
    renderComponent();
    expect(await screen.findByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('follows tags and broadcasts pop + recommend on click', async () => {
    renderComponent();
    fireEvent.click(await screen.findByText('Frontend'));
    await waitFor(() =>
      expect(mockOnFollowTags).toHaveBeenCalledWith({
        tags: ['react', 'css'],
        requireLogin: true,
      }),
    );
    expect(broadcastPersonaSelection).toHaveBeenCalledWith(['react', 'css']);
    expect(broadcastRecommendRequest).toHaveBeenCalledWith(['react', 'css']);
  });

  it('allows multi-select without unfollowing previous persona', async () => {
    renderComponent();
    fireEvent.click(await screen.findByText('Frontend'));
    await waitFor(() => expect(mockOnFollowTags).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByText('Backend'));
    await waitFor(() => expect(mockOnFollowTags).toHaveBeenCalledTimes(2));

    expect(mockOnFollowTags).toHaveBeenLastCalledWith({
      tags: ['node', 'sql'],
      requireLogin: true,
    });
    expect(mockOnUnfollowTags).not.toHaveBeenCalled();
  });

  it('disables additional personas after 3 are selected', async () => {
    renderComponent();
    fireEvent.click(await screen.findByText('Frontend'));
    await waitFor(() => expect(mockOnFollowTags).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByText('Backend'));
    await waitFor(() => expect(mockOnFollowTags).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByText('Mobile'));
    await waitFor(() => expect(mockOnFollowTags).toHaveBeenCalledTimes(3));

    const devopsButton = screen.getByText('DevOps').closest('button');
    expect(devopsButton).toBeDisabled();

    fireEvent.click(screen.getByText('DevOps'));
    expect(mockOnFollowTags).toHaveBeenCalledTimes(3);
  });

  it('deselects only the clicked persona', async () => {
    renderComponent();
    fireEvent.click(await screen.findByText('Frontend'));
    await waitFor(() => expect(mockOnFollowTags).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByText('Backend'));
    await waitFor(() => expect(mockOnFollowTags).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByText('Frontend'));
    await waitFor(() =>
      expect(mockOnUnfollowTags).toHaveBeenCalledWith({
        tags: ['react', 'css'],
      }),
    );
    expect(mockOnUnfollowTags).toHaveBeenCalledTimes(1);
  });
});
