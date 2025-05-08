import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { DiscountTimer } from './DiscountTimer';
import { setupDateMock } from '../../../../__tests__/helpers/dateMock';

describe('DiscountTimer component', () => {
  let dateMock;
  const initialDate = new Date('2023-01-01T00:00:00Z');

  beforeEach(() => {
    dateMock = setupDateMock(initialDate);
  });

  afterEach(() => {
    dateMock.cleanup();
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(
      <DiscountTimer
        discountMessage="Special offer ends in"
        durationInMinutes={5}
        startDate={initialDate}
        isActive
      />,
    );

    expect(screen.getByTestId('discount-message')).toHaveTextContent(
      'Special offer ends in',
    );
    expect(screen.getByTestId('timer-display')).toHaveTextContent('05:00');
  });

  it('sanitizes HTML in discount message', () => {
    render(
      <DiscountTimer
        discountMessage="<b>Limited</b> time <script>alert('test')</script> offer"
        durationInMinutes={5}
        isActive
      />,
    );

    const messageElement = screen.getByTestId('discount-message');
    expect(messageElement.innerHTML).toContain('<b>Limited</b>');
    expect(messageElement.innerHTML).not.toContain('script');
  });

  it('counts down correctly', () => {
    render(
      <DiscountTimer
        discountMessage="Offer ends soon"
        durationInMinutes={5}
        startDate={initialDate}
        isActive
      />,
    );

    const timerDisplay = screen.getByTestId('timer-display');

    expect(timerDisplay).toHaveTextContent('05:00');

    // Advance by 1.5 minutes
    act(() => dateMock.advanceTimeByMinutes(1.5));

    expect(timerDisplay).toHaveTextContent('03:30');
  });

  it('calls onTimerEnd when timer reaches zero', () => {
    const mockOnTimerEnd = jest.fn();

    render(
      <DiscountTimer
        discountMessage="Hurry up!"
        durationInMinutes={1}
        startDate={initialDate}
        onTimerEnd={mockOnTimerEnd}
        isActive
      />,
    );

    expect(mockOnTimerEnd).not.toHaveBeenCalled();
    dateMock.advanceTimeByMinutes(2);
    expect(mockOnTimerEnd).toHaveBeenCalledTimes(1);
  });

  it('does not start timer when isActive is false', () => {
    const mockOnTimerEnd = jest.fn();

    render(
      <DiscountTimer
        discountMessage="Timer paused"
        durationInMinutes={5}
        startDate={initialDate}
        onTimerEnd={mockOnTimerEnd}
        isActive={false}
      />,
    );

    expect(screen.getByTestId('timer-display')).toHaveTextContent('00:00');

    // Advance time but the timer should not trigger onTimerEnd
    dateMock.advanceTimeByMinutes(6);
    expect(mockOnTimerEnd).not.toHaveBeenCalled();
    expect(screen.getByTestId('timer-display')).toHaveTextContent('00:00');
  });
});
