import { renderHook } from '@testing-library/react';
import { useEngagementBarV2 } from './useEngagementBarV2';

describe('useEngagementBarV2', () => {
  it('keeps the v2 engagement bar enabled for review', () => {
    const { result } = renderHook(() => useEngagementBarV2());

    expect(result.current).toBe(true);
  });
});
