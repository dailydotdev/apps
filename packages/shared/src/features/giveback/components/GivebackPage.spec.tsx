import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GivebackPage } from './GivebackPage';
import { GivebackProvider } from '../GivebackContext';
import { CommunityGoalProgress } from './CommunityGoalProgress';
import { GivebackReviewToggle } from './GivebackReviewToggle';

describe('GivebackPage', () => {
  it('renders the baseline sections: hero, community goal, and roadmap', () => {
    render(<GivebackPage />);

    expect(
      screen.getByText('Daily Dev funds the donation. You help unlock it.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Community goal')).toBeInTheDocument();
    expect(screen.getByText('Your roadmap')).toBeInTheDocument();
  });

  it('shows the mocked goal progress at 50%', () => {
    render(<GivebackPage />);

    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getByText('of $10,000')).toBeInTheDocument();
    expect(screen.getByText('50% unlocked')).toBeInTheDocument();
  });
});

describe('GivebackReviewToggle', () => {
  it('updates the community goal progress when a preset is selected', async () => {
    render(
      <GivebackProvider>
        <CommunityGoalProgress />
        <GivebackReviewToggle />
      </GivebackProvider>,
    );

    expect(screen.getByText('50% unlocked')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '100%' }));

    expect(screen.getByText('100% unlocked')).toBeInTheDocument();
  });
});
