import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { DiscountTimer } from './DiscountTimer';

let mockStartDate: Date;

function increaseTimeByMinutes(minutes: number) {
  mockStartDate = new Date(mockStartDate.getTime() + minutes * 60 * 1000);
  jest.advanceTimersByTime(minutes * 60 * 1000);
}

describe('DiscountTimer component', () => {
  let RealDate: typeof Date;
  let MockDate: unknown;

  beforeEach(() => {
    // Store the real Date constructor
    RealDate = global.Date;

    mockStartDate = new Date('2023-01-01T00:00:00Z');

    // Create a mock class that extends Date
    MockDate = class MockDateCls extends Date {
      constructor(...args) {
        if (args.length === 0) {
          super(mockStartDate);
          return this;
        }
        // Call super with the first argument to avoid spread errors
        super(args[0]);
        return this;
      }

      static now() {
        return new RealDate(mockStartDate).getTime();
      }
    };

    // Replace the global Date constructor
    global.Date = MockDate as typeof global.Date;

    // Use fake timers but don't call setSystemTime since we're mocking Date
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Restore the original Date constructor
    global.Date = RealDate;
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(
      <DiscountTimer
        discountMessage="Special offer ends in"
        durationInMinutes={5}
        startDate={mockStartDate}
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
        startDate={mockStartDate}
      />,
    );

    const timerDisplay = screen.getByTestId('timer-display');

    expect(timerDisplay).toHaveTextContent('05:00');

    // Advance by 1 minute
    act(() => increaseTimeByMinutes(1.5));

    expect(timerDisplay).toHaveTextContent('03:30');
  });

  it('calls onTimerEnd when timer reaches zero', () => {
    const mockOnTimerEnd = jest.fn();

    render(
      <DiscountTimer
        discountMessage="Hurry up!"
        durationInMinutes={1}
        startDate={mockStartDate}
        onTimerEnd={mockOnTimerEnd}
      />,
    );

    expect(mockOnTimerEnd).not.toHaveBeenCalled();
    for (let i = 0; i < 2; i += 1) {
      act(() => increaseTimeByMinutes(1));
    }
    expect(mockOnTimerEnd).toHaveBeenCalledTimes(1);
  });
});
