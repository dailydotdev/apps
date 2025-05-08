/**
 * Utility functions for mocking Date in Jest tests
 */

import { act } from '@testing-library/react';

type DateMock = {
  advanceTimeByMinutes: (minutes: number) => void;
  getCurrentMockDate: () => Date;
  cleanup: () => void;
};

/**
 * Sets up a mocked Date implementation for testing time-dependent components
 * @param initialDate - The initial date to mock (default: new Date())
 * @returns Object with utility functions and cleanup method
 */
export const setupDateMock = (initialDate = new Date()): DateMock => {
  let mockDate = new Date(initialDate);
  const RealDate = global.Date;

  // Create a mock Date class
  const MockDate = class extends Date {
    constructor(...args: Parameters<typeof Date>) {
      if (args.length === 0) {
        super(mockDate);
        return this;
      }
      super(...args);
      return this;
    }

    static now() {
      return new RealDate(mockDate).getTime();
    }
  };

  // Replace the global Date constructor
  global.Date = MockDate as typeof Date;

  // Use fake timers
  jest.useFakeTimers();

  return {
    /**
     * Advance the mock date by specified minutes
     * @param minutes - Number of minutes to advance the time
     */
    advanceTimeByMinutes: (minutes: number) => {
      const seconds = Math.floor(minutes * 60);
      for (let i = 0; i < seconds; i += 1) {
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        act(() => {
          mockDate = new Date(mockDate.getTime() + 1000);
          jest.advanceTimersByTime(1000);
        });
      }
    },

    /**
     * Get the current mock date
     */
    getCurrentMockDate: () => new Date(mockDate),

    /**
     * Clean up the date mock
     */
    cleanup: () => {
      global.Date = RealDate;
      jest.useRealTimers();
    },
  };
};
