import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import HorizontalScroll from './HorizontalScroll';
import { useCalculateVisibleElements } from './useCalculateVisibleElements';

jest.mock('./useCalculateVisibleElements');

describe('HorizontalScroll', () => {
  beforeEach(() => {
    (useCalculateVisibleElements as jest.Mock).mockReturnValue({
      scrollableElementWidth: 100,
      isOverflowing: true,
      elementsCount: 5,
    });
  });
  it('renders correctly with the given title and children', () => {
    render(
      <HorizontalScroll scrollProps={{ title: 'Scrollable Area' }}>
        <div>Child Content</div>
      </HorizontalScroll>,
    );

    expect(screen.getByText('Scrollable Area')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Scrollable Area' }),
    ).toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    render(
      <HorizontalScroll
        scrollProps={{ title: 'Scrollable Area' }}
        className={{ scroll: 'custom-class' }}
      >
        <div>Child Content</div>
      </HorizontalScroll>,
    );

    expect(screen.getByRole('region')).toHaveClass('custom-class');
  });

  it('triggers onClickSeeAll when the see all button is clicked', () => {
    const mockOnClickSeeAll = jest.fn();
    render(
      <HorizontalScroll
        scrollProps={{ onClickSeeAll: mockOnClickSeeAll, title: 'Scrollable ' }}
      >
        <div>Child Content</div>
      </HorizontalScroll>,
    );

    const seeAllButton = screen.getByText('See all');
    fireEvent.click(seeAllButton);
    expect(mockOnClickSeeAll).toHaveBeenCalled();
  });
});
