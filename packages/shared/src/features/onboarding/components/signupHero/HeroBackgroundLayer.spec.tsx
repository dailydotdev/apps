import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroBackgroundLayer } from './HeroBackgroundLayer';

jest.mock('./CardsBackground', () => ({
  CardsBackground: ({ splitMode }: { splitMode?: boolean }) => (
    <div data-testid="cards-bg" data-split={String(!!splitMode)} />
  ),
}));

jest.mock('./DeskBackground', () => ({
  DeskBackground: () => <div data-testid="desk-bg" />,
}));

describe('HeroBackgroundLayer', () => {
  it('renders the cards mosaic for the cards background regardless of image mode', () => {
    render(<HeroBackgroundLayer background="cards" imageMode="colors" />);
    expect(screen.getByTestId('cards-bg')).toHaveAttribute(
      'data-split',
      'false',
    );
    expect(screen.queryByTestId('desk-bg')).not.toBeInTheDocument();
  });

  it('renders the split cards mosaic for the split background', () => {
    render(<HeroBackgroundLayer background="split" imageMode="image" />);
    expect(screen.getByTestId('cards-bg')).toHaveAttribute(
      'data-split',
      'true',
    );
  });

  it('renders the desk photo when image mode is image', () => {
    render(<HeroBackgroundLayer background="desk" imageMode="image" />);
    expect(screen.getByTestId('desk-bg')).toBeInTheDocument();
    expect(screen.queryByTestId('cards-bg')).not.toBeInTheDocument();
  });

  it('omits the desk photo when image mode is colors', () => {
    render(<HeroBackgroundLayer background="desk" imageMode="colors" />);
    expect(screen.queryByTestId('desk-bg')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cards-bg')).not.toBeInTheDocument();
  });
});
