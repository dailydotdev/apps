import React from 'react';
import { render, screen } from '@testing-library/react';
import PollMetadata from './PollMetadata';
import type { PollMetadataProps } from './PollMetadata';

jest.mock('../../../lib', () => ({
  largeNumberFormat: jest.fn((num: number) => {
    if (num < 1000) {
      return num.toString();
    }
    if (num < 1000000) {
      return `${Math.floor(num / 1000)}K`;
    }
    return `${Math.floor(num / 1000000)}M`;
  }),
}));

const futureDate = new Date();
futureDate.setFullYear(futureDate.getFullYear() + 1);

const defaultProps: PollMetadataProps = {
  endsAt: futureDate.toISOString(),
  isAuthor: false,
  numPollVotes: 5,
};

const renderComponent = (props: Partial<PollMetadataProps> = {}) => {
  return render(<PollMetadata {...defaultProps} {...props} />);
};

describe('PollMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Active polls', () => {
    it('should show "New poll" for polls with less than 10 votes when not author', () => {
      renderComponent({ numPollVotes: 5, isAuthor: false });

      expect(screen.getByText('New poll')).toBeInTheDocument();
      expect(screen.queryByText(/votes/)).not.toBeInTheDocument();
    });

    it('should show "Voting open" for polls with more than 10 votes', () => {
      renderComponent({ numPollVotes: 15, isAuthor: false });

      expect(screen.getByText('Voting open')).toBeInTheDocument();
      expect(screen.getByText('15 votes')).toBeInTheDocument();
    });

    it('should show "Voting open" for author even with less than 10 votes', () => {
      renderComponent({ numPollVotes: 3, isAuthor: true });

      expect(screen.getByText('Voting open')).toBeInTheDocument();
      expect(screen.getByText('3 votes')).toBeInTheDocument();
    });

    it('should format large vote numbers', () => {
      renderComponent({ numPollVotes: 1500 });

      expect(screen.getByText('1K votes')).toBeInTheDocument();
    });
  });

  describe('Ended polls', () => {
    it('should show "Voting ended" for expired polls', () => {
      renderComponent({ endsAt: '2023-01-10T10:30:00.000Z' });

      expect(screen.getByText('Voting ended')).toBeInTheDocument();
      expect(screen.queryByText('Voting open')).not.toBeInTheDocument();
      expect(screen.queryByText('New poll')).not.toBeInTheDocument();
    });

    it('should show "total votes" for ended polls with vote count', () => {
      renderComponent({
        endsAt: '2023-01-10T10:30:00.000Z',
        numPollVotes: 45,
      });

      expect(screen.getByText('Voting ended')).toBeInTheDocument();
      expect(screen.getByText('45 total votes')).toBeInTheDocument();
    });
  });

  it('should handle polls without end date', () => {
    renderComponent({ endsAt: undefined, numPollVotes: 15 });

    expect(screen.getByText('Voting open')).toBeInTheDocument();
    expect(screen.getByText('15 votes')).toBeInTheDocument();
  });
});
