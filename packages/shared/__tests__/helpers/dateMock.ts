/**
 * Utility functions for mocking Date in Jest tests
 */

import { act } from '@testing-library/react';

export type DateMock = {
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
  jest.useFakeTimers();
  jest.setSystemTime(initialDate);

  return {
    /**
     * Advance the mock date by specified minutes
     * @param minutes - Number of minutes to advance the time
     */
    advanceTimeByMinutes: (minutes: number) => {
      act(() => {
        jest.advanceTimersByTime(minutes * 60 * 1000);
      });
    },

    /**
     * Get the current mock date
     */
    getCurrentMockDate: () => new Date(jest.now()),

    /**
     * Clean up the date mock
     */
    cleanup: () => {
      jest.useRealTimers();
    },
  };
};
