import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SquadFavoriteButton } from './SquadFavoriteButton';
import { useSquadFavorite } from '../../hooks/squads/useSquadFavorite';
import { generateTestSquad } from '../../../__tests__/fixture/squads';
import type { Squad } from '../../graphql/sources';

jest.mock('../../hooks/squads/useSquadFavorite', () => ({
  useSquadFavorite: jest.fn(),
}));

const toggleFavorite = jest.fn();

const renderButton = (overrides: Partial<Squad> = {}) =>
  render(<SquadFavoriteButton squad={generateTestSquad(overrides)} />);

describe('SquadFavoriteButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSquadFavorite).mockReturnValue({
      toggleFavorite,
      isPending: false,
    });
  });

  it('renders an unpressed star with the correct aria label when not favorited', () => {
    renderButton({ favoritedAt: null });

    const button = screen.getByRole('button', { name: 'Favorite squad' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders a pressed star with the unfavorite aria label when favorited', () => {
    renderButton({ favoritedAt: '2025-01-01T00:00:00.000Z' });

    const button = screen.getByRole('button', { name: 'Unfavorite squad' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls toggleFavorite with the squad when clicked', async () => {
    const squad = generateTestSquad({ favoritedAt: null });
    render(<SquadFavoriteButton squad={squad} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Favorite squad' }),
    );

    expect(toggleFavorite).toHaveBeenCalledWith(squad);
  });

  it('applies hover-reveal classes when the squad is not favorited', () => {
    renderButton({ favoritedAt: null });

    const button = screen.getByRole('button', { name: 'Favorite squad' });
    expect(button).toHaveClass('laptop:opacity-0');
    expect(button).toHaveClass('laptop:group-hover/squad-row:opacity-100');
    expect(button).toHaveClass(
      'laptop:group-focus-within/squad-row:opacity-100',
    );
  });

  it('does not apply hover-reveal classes when the squad is already favorited', () => {
    renderButton({ favoritedAt: '2025-01-01T00:00:00.000Z' });

    const button = screen.getByRole('button', { name: 'Unfavorite squad' });
    expect(button).not.toHaveClass('laptop:opacity-0');
    expect(button).not.toHaveClass('laptop:group-hover/squad-row:opacity-100');
    expect(button).not.toHaveClass(
      'laptop:group-focus-within/squad-row:opacity-100',
    );
  });
});
