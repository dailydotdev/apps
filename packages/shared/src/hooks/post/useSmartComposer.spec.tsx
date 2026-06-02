import { renderHook } from '@testing-library/react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useFeaturesReadyContext } from '../../components/GrowthBookProvider';
import { featureSmartComposer } from '../../lib/featureManagement';
import { useSmartComposer } from './useSmartComposer';

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../components/GrowthBookProvider', () => ({
  useFeaturesReadyContext: jest.fn(),
}));

describe('useSmartComposer', () => {
  const getFeatureValue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuthContext).mockReturnValue({
      user: { id: 'user-1' },
      isAuthReady: true,
    } as unknown as ReturnType<typeof useAuthContext>);
    jest.mocked(useFeaturesReadyContext).mockReturnValue({
      ready: true,
      getFeatureValue,
    });
  });

  it('evaluates the experiment only when requested', () => {
    getFeatureValue.mockReturnValue(true);

    const { result } = renderHook(() => useSmartComposer());

    expect(getFeatureValue).not.toHaveBeenCalled();
    expect(result.current.evaluateSmartComposer()).toBe(true);
    expect(getFeatureValue).toHaveBeenCalledWith(featureSmartComposer);
  });

  it('returns the default value without enrolling when features are not ready', () => {
    jest.mocked(useFeaturesReadyContext).mockReturnValue({
      ready: false,
      getFeatureValue,
    });

    const { result } = renderHook(() => useSmartComposer());

    expect(result.current.evaluateSmartComposer()).toBe(false);
    expect(getFeatureValue).not.toHaveBeenCalled();
  });
});
