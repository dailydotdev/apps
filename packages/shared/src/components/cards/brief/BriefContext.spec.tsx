import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { mocked } from 'ts-jest/utils';

import { BriefContextProvider, useBriefContext } from './BriefContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePersistentState } from '../../../hooks';
// eslint-disable-next-line import/extensions
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
// eslint-disable-next-line import/extensions
import { defaultQueryClientTestingConfig } from '../../../../__tests__/helpers/tanstack-query';
// eslint-disable-next-line import/extensions
import defaultUser from '../../../../__tests__/fixture/loggedUser';

// Mock dependencies
jest.mock('../../../contexts/AuthContext');
jest.mock('../../../hooks');

const mockUseAuthContext = mocked(useAuthContext);
const mockUsePersistentState = mocked(usePersistentState);

const mockSetBrief = jest.fn();

describe('BriefContext', () => {
  let client: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient(defaultQueryClientTestingConfig);

    mockUseAuthContext.mockReturnValue({
      user: defaultUser,
      isLoggedIn: true,
      isAuthReady: true,
      updateUser: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <TestBootProvider client={client}>
      <BriefContextProvider>{children}</BriefContextProvider>
    </TestBootProvider>
  );

  describe('BriefContextProvider', () => {
    it('should provide initial context values when no data is persisted', () => {
      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      const { result } = renderHook(() => useBriefContext(), {
        wrapper: TestWrapper,
      });

      expect(result.current.brief).toBeUndefined();
      expect(typeof result.current.setBrief).toBe('function');
    });

    it('should provide brief data when persisted', () => {
      const mockBrief = {
        id: 'brief-123',
        createdAt: new Date(),
      };

      mockUsePersistentState.mockReturnValueOnce([
        mockBrief,
        mockSetBrief,
        true,
      ]);

      const { result } = renderHook(() => useBriefContext(), {
        wrapper: TestWrapper,
      });

      expect(result.current.brief).toEqual(mockBrief);
    });

    it('should use user ID in persistent state key', () => {
      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      renderHook(() => useBriefContext(), {
        wrapper: TestWrapper,
      });

      expect(mockUsePersistentState).toHaveBeenCalledWith(
        `brief_card_${defaultUser.id}_v3`,
        undefined,
      );
    });
  });

  describe('useBriefContext', () => {
    it('should throw error when used outside provider', () => {
      // Temporarily suppress console.error for this test
      // eslint-disable-next-line no-console
      const originalError = console.error;
      // eslint-disable-next-line no-console
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useBriefContext());
      }).toThrow();

      // eslint-disable-next-line no-console
      console.error = originalError;
    });
  });

  describe('setBrief functionality', () => {
    it('should call setBrief when brief is updated', () => {
      const mockBrief = {
        id: 'brief-123',
        createdAt: new Date(),
      };

      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      const { result } = renderHook(() => useBriefContext(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.setBrief(mockBrief);
      });

      expect(mockSetBrief).toHaveBeenCalledWith(mockBrief);
    });
  });
});
