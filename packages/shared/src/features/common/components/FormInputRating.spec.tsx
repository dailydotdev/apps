import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormInputRating } from './FormInputRating';
import type { FormInputRatingProps } from './FormInputRating';

const renderComponent = (
  props: Partial<FormInputRatingProps> = {},
): RenderResult => {
  const defaultProps: FormInputRatingProps = {
    max: 5,
    min: 1,
    name: 'rating',
    onValueChange: jest.fn(),
  };
  return render(<FormInputRating {...defaultProps} {...props} />);
};

describe('FormInputRating', () => {
  it('should render with default props', () => {
    const onValueChange = jest.fn();
    renderComponent({ onValueChange });

    // Should have 5 buttons (min=1, max=5)
    const buttons = screen.getAllByRole('radio');
    expect(buttons).toHaveLength(5);

    // Should have correct labels
    for (let i = 1; i <= 5; i += 1) {
      expect(screen.getByLabelText(`${i} stars`)).toBeInTheDocument();
    }
  });

  it('should render with custom min and max', () => {
    renderComponent({ min: 0, max: 10 });

    // Should have 11 buttons (min=0, max=10)
    const buttons = screen.getAllByRole('radio');
    expect(buttons).toHaveLength(11);

    // Should have correct values
    for (let i = 0; i <= 10; i += 1) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  it('should render with defaultValue', () => {
    renderComponent({ defaultValue: 3 });

    // The button with value 3 should be selected
    const selectedButton = screen.getByRole('radio', { checked: true });
    expect(selectedButton).toHaveTextContent('3');
  });

  it('should render with controlled value', () => {
    renderComponent({ value: 4 });

    // The button with value 4 should be selected
    const selectedButton = screen.getByRole('radio', { checked: true });
    expect(selectedButton).toHaveTextContent('4');
  });

  it('should call onValueChange when a rating is selected', () => {
    const onValueChange = jest.fn();
    renderComponent({ onValueChange });

    // Click on the button with value 3
    const button = screen.getByText('3');
    fireEvent.click(button);

    // onValueChange should be called with the selected value
    expect(onValueChange).toHaveBeenCalledWith(3);
  });

  it('should handle button click correctly', () => {
    const onValueChange = jest.fn();
    renderComponent({ onValueChange });

    // Click on button with value 2
    fireEvent.click(screen.getByText('2'));
    expect(onValueChange).toHaveBeenCalledWith(2);

    // Click on button with value 4
    fireEvent.click(screen.getByText('4'));
    expect(onValueChange).toHaveBeenCalledWith(4);
  });

  it('should fix max value when max < min', () => {
    renderComponent({ min: 3, max: 2 });

    // Should have 2 buttons (min=3, max=4)
    const buttons = screen.getAllByRole('radio');
    expect(buttons).toHaveLength(2);

    // Should have buttons with values 3 and 4
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should throw an error for invalid defaultValue', () => {
    // Mock console.error to prevent it from showing in test output
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderComponent({ min: 2, max: 5, defaultValue: 1 });
    }).toThrow('defaultValue must be between 2 and 5');

    // Restore console.error
    console.error = originalError;
  });

  it('should render children when provided', () => {
    renderComponent({
      children: <div data-testid="rating-children">Custom content</div>,
    });

    expect(screen.getByTestId('rating-children')).toBeInTheDocument();
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    renderComponent({ className: 'custom-class' });

    const buttons = screen.getAllByRole('radio');
    buttons.forEach((button) => {
      expect(button).toHaveClass('custom-class');
    });
  });

  it('should have correct accessibility attributes', () => {
    renderComponent();

    // Check radiogroup role
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();

    // Check individual radio buttons
    const buttons = screen.getAllByRole('radio');
    expect(buttons).toHaveLength(5);

    for (let i = 0; i < 5; i += 1) {
      const value = i + 1;
      const button = buttons[i];

      expect(button).toHaveAttribute('aria-checked', 'false');
      expect(button).toHaveAttribute('aria-label', `${value} stars`);
      expect(button).toHaveAttribute('aria-posinset', value.toString());
      expect(button).toHaveAttribute('aria-setsize', '5');
    }
  });
});
