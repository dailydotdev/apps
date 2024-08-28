import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import HorizontalScroll from './HorizontalScroll';

describe('HorizontalScroll', () => {
  it('renders correctly with the given title and children', () => {
    render(
      <HorizontalScroll title="Scrollable Area">
        <div>Child Content</div>
      </HorizontalScroll>,
    );

    expect(screen.getByText('Scrollable Area')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Horizontal Scroll' }),
    ).toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    render(
      <HorizontalScroll className="custom-class" title="Scrollable Area">
        <div>Child Content</div>
      </HorizontalScroll>,
    );

    expect(screen.getByRole('region')).toHaveClass('custom-class');
  });

  it('triggers onClickSeeAll when the see all button is clicked', () => {
    const mockOnClickSeeAll = jest.fn();
    render(
      <HorizontalScroll
        title="Scrollable Area"
        onClickSeeAll={mockOnClickSeeAll}
      >
        <div>Child Content</div>
      </HorizontalScroll>,
    );

    const seeAllButton = screen.getByText('See all');
    fireEvent.click(seeAllButton);
    expect(mockOnClickSeeAll).toHaveBeenCalled();
  });
});
