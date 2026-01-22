import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PollOptions from './PollOptions';
import type { PollOption } from '../../../graphql/posts';

const mockOptions: PollOption[] = [
  {
    id: 'option-1',
    text: 'JavaScript',
    order: 1,
    numVotes: 45,
  },
  {
    id: 'option-2',
    text: 'Python',
    order: 2,
    numVotes: 32,
  },
];

const futureDate = new Date();
futureDate.setFullYear(futureDate.getFullYear() + 1);

describe('PollOptions', () => {
  it('should render buttons when user has not voted and poll is active', () => {
    const mockOnClick = jest.fn();

    render(
      <PollOptions
        options={mockOptions}
        onClick={mockOnClick}
        userVote={undefined}
        numPollVotes={77}
        endsAt={futureDate.toISOString()}
        shouldAnimateResults={false}
      />,
    );

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();

    const jsButton = screen.getByRole('button', { name: /JavaScript/i });
    expect(jsButton).toBeInTheDocument();

    fireEvent.click(jsButton);
    expect(mockOnClick).toHaveBeenCalledWith('option-1', 'JavaScript');
  });

  it('should render results when user has voted', () => {
    render(
      <PollOptions
        options={mockOptions}
        onClick={jest.fn()}
        userVote="option-1"
        numPollVotes={77}
        endsAt={futureDate.toISOString()}
        shouldAnimateResults={false}
      />,
    );

    expect(screen.getByText('58%')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /JavaScript/i }),
    ).not.toBeInTheDocument();
  });

  it('should render results when poll has ended', () => {
    render(
      <PollOptions
        options={mockOptions}
        onClick={jest.fn()}
        userVote={undefined}
        numPollVotes={77}
        endsAt="2023-01-10T10:30:00.000Z"
        shouldAnimateResults={false}
      />,
    );

    expect(screen.getByText('58%')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /JavaScript/i }),
    ).not.toBeInTheDocument();
  });
});
