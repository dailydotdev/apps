import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import type { AuthContextData } from '../contexts/AuthContext';
import AuthContext from '../contexts/AuthContext';
import { getLogContextStatic } from '../contexts/LogContext';
import type { LogContextData } from './log/useLogContextData';
import { useConditionalFeature } from './useConditionalFeature';
import usePersistentContext from './usePersistentContext';
import { useGooglePreferredSource } from './useGooglePreferredSource';
import { usePreferredSource } from './usePreferredSource';

jest.mock('./useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('./usePersistentContext', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('./useGooglePreferredSource', () => ({
  useGooglePreferredSource: jest.fn(),
}));

const mockFeature = jest.mocked(useConditionalFeature);
const mockPersistent = jest.mocked(usePersistentContext);
const mockGoogle = jest.mocked(useGooglePreferredSource);

const LogContext = getLogContextStatic();

const setHasAdded = jest.fn();
const addPreferredSource = jest.fn();
const logEvent = jest.fn();

const render = ({
  isEnabled = true,
  hasAdded = false,
  isPermanent = false,
}: {
  isEnabled?: boolean;
  hasAdded?: boolean;
  isPermanent?: boolean;
} = {}) => {
  mockFeature.mockReturnValue({ value: isEnabled, isLoading: false });
  mockPersistent.mockReturnValue([hasAdded, setHasAdded, true, false]);

  return renderHook(
    () => usePreferredSource({ placement: 'post widgets', isPermanent }),
    {
      wrapper: ({ children }) => (
        <AuthContext.Provider
          value={{ isAuthReady: true } as unknown as AuthContextData}
        >
          <LogContext.Provider
            value={{ logEvent } as unknown as LogContextData}
          >
            {children}
          </LogContext.Provider>
        </AuthContext.Provider>
      ),
    },
  );
};

describe('usePreferredSource', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGoogle.mockReturnValue({
      isReady: true,
      hasFailed: false,
      addPreferredSource,
    });
  });

  it('is not eligible while the flag is off', () => {
    const { result } = render({ isEnabled: false });

    expect(result.current.isEligible).toBe(false);
  });

  it('never loads Google script while the flag is off', () => {
    render({ isEnabled: false });

    expect(mockGoogle).toHaveBeenCalledWith({ enabled: false });
  });

  it('goes quiet once the reader has added us', () => {
    const { result } = render({ hasAdded: true });

    expect(result.current.isEligible).toBe(false);
  });

  it('stays eligible after adding when permanent', () => {
    const { result } = render({ hasAdded: true, isPermanent: true });

    expect(result.current.isEligible).toBe(true);
  });

  it('stays gated on the flag even when permanent', () => {
    const { result } = render({ isEnabled: false, isPermanent: true });

    expect(result.current.isEligible).toBe(false);
  });

  it('records the answer optimistically on add', async () => {
    const { result } = render();

    result.current.onAdd();

    await waitFor(() => expect(addPreferredSource).toHaveBeenCalled());
    expect(setHasAdded).toHaveBeenCalledWith(true);
  });
});
