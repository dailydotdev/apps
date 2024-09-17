import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import {
  UseHorizontalScrollHeaderProps,
  useHorizontalScrollHeader,
} from './useHorizontalScrollHeader';
import { useScrollManagement } from './useScrollManagement';

jest.mock('./useScrollManagement');

const TestComponent = ({
  title,
  onScroll,
  onClickSeeAll,
}: UseHorizontalScrollHeaderProps) => {
  const { Header, ref } = useHorizontalScrollHeader({
    title,
    onScroll,
    onClickSeeAll,
  });
  return (
    <div ref={ref}>
      <Header />
    </div>
  );
};

describe('useHorizontalScrollHeader', () => {
  beforeEach(() => {
    (useScrollManagement as jest.Mock).mockReturnValue({
      isAtStart: true,
      isAtEnd: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the header with provided title', () => {
    render(<TestComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onScroll when clicking right arrow', () => {
    const mockOnScroll = jest.fn();
    render(<TestComponent title="Test Title" onScroll={mockOnScroll} />);
    fireEvent.click(screen.getByLabelText('Scroll right'));
    expect(mockOnScroll).toHaveBeenCalled();
  });

  it('calls onScroll when clicking left arrow', () => {
    (useScrollManagement as jest.Mock).mockReturnValue({
      isAtStart: false,
      isAtEnd: true,
    });
    const mockOnScroll = jest.fn();
    render(<TestComponent title="Test Title" onScroll={mockOnScroll} />);
    fireEvent.click(screen.getByLabelText('Scroll left'));
    expect(mockOnScroll).toHaveBeenCalled();
  });

  it('calls onClickSeeAll when the See All button is clicked', () => {
    const mockOnClickSeeAll = jest.fn();
    render(
      <TestComponent title="Test Title" onClickSeeAll={mockOnClickSeeAll} />,
    );
    fireEvent.click(screen.getByText('See all'));
    expect(mockOnClickSeeAll).toHaveBeenCalled();
  });

  it('disables the left arrow button when at the start', () => {
    render(<TestComponent title="Test Title" />);
    expect(screen.getByLabelText('Scroll left')).toBeDisabled();
  });

  it('disables the right arrow button when at the end', () => {
    (useScrollManagement as jest.Mock).mockReturnValue({
      isAtStart: false,
      isAtEnd: true,
    });
    render(<TestComponent title="Test Title" />);
    expect(screen.getByLabelText('Scroll right')).toBeDisabled();
  });
});
