import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import HorizontalScroll from './HorizontalScroll';
import { useScrollManagement } from './useScrollManagement';

jest.mock('./useScrollManagement');

describe('HorizontalScroll', () => {
  beforeEach(() => {
    (useScrollManagement as jest.Mock).mockReturnValue({
      isAtStart: true,
      isAtEnd: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title correctly', () => {
    render(
      <HorizontalScroll title="Test Title">
        <div>Child 1</div>
        <div>Child 2</div>
      </HorizontalScroll>,
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <HorizontalScroll title="Test Title">
        <div>Child 1</div>
        <div>Child 2</div>
      </HorizontalScroll>,
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('calls onScroll when clicking right arrow', () => {
    const mockOnScroll = jest.fn();
    render(
      <HorizontalScroll title="Test Title" onScroll={mockOnScroll}>
        <div>Child 1</div>
        <div>Child 2</div>
      </HorizontalScroll>,
    );
    const rightButton = screen.getByLabelText('Scroll right');

    fireEvent.click(rightButton);
    expect(mockOnScroll).toHaveBeenCalled();
  });

  it('calls onScroll when clicking left arrow', () => {
    (useScrollManagement as jest.Mock).mockReturnValue({
      isAtStart: false,
      isAtEnd: true,
    });
    const mockOnScroll = jest.fn();
    render(
      <HorizontalScroll title="Test Title" onScroll={mockOnScroll}>
        <div>Child 1</div>
        <div>Child 2</div>
      </HorizontalScroll>,
    );
    const leftButton = screen.getByLabelText('Scroll left');

    fireEvent.click(leftButton);
    expect(mockOnScroll).toHaveBeenCalled();
  });

  it('calls onClickSeeAll when the See All button is clicked', () => {
    const mockOnClickSeeAll = jest.fn();
    render(
      <HorizontalScroll title="Test Title" onClickSeeAll={mockOnClickSeeAll}>
        <div>Child 1</div>
        <div>Child 2</div>
      </HorizontalScroll>,
    );
    const seeAllButton = screen.getByText('See all');
    fireEvent.click(seeAllButton);
    expect(mockOnClickSeeAll).toHaveBeenCalled();
  });

  it('disables the left arrow button when at the start', () => {
    render(
      <HorizontalScroll title="Test Title">
        <div>Child 1</div>
        <div>Child 2</div>
      </HorizontalScroll>,
    );

    const leftButton = screen.getByLabelText('Scroll left');
    expect(leftButton).toBeDisabled();
  });

  it('disables the right arrow button when at the end', () => {
    (useScrollManagement as jest.Mock).mockReturnValue({
      isAtStart: false,
      isAtEnd: true,
    });
    render(
      <HorizontalScroll title="Test Title">
        <div>Child 1</div>
        <div>Child 2</div>
      </HorizontalScroll>,
    );

    const rightButton = screen.getByLabelText('Scroll right');
    expect(rightButton).toBeDisabled();
  });
});
