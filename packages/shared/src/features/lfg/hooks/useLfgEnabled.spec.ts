import { renderHook } from '@testing-library/react';
import { useLfgEnabled } from './useLfgEnabled';

let mockAttributedUserId: string | undefined;

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'me' } }),
}));
jest.mock('../../../components/GrowthBookProvider', () => ({
  useGrowthBookContext: () => ({
    growthbook: { getAttributes: () => ({ userId: mockAttributedUserId }) },
  }),
}));
jest.mock('../../messages/hooks/useMessagesEnabled', () => ({
  useMessagesEnabled: () => ({ isEnabled: true, isGatedOut: false }),
}));
jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: () => ({ value: false, isLoading: false }),
}));

describe('useLfgEnabled', () => {
  it("doesn't gate out on an evaluation made with someone else's attributes", () => {
    mockAttributedUserId = 'anonymous';
    expect(renderHook(() => useLfgEnabled()).result.current.isGatedOut).toBe(
      false,
    );

    mockAttributedUserId = 'me';
    expect(renderHook(() => useLfgEnabled()).result.current.isGatedOut).toBe(
      true,
    );
  });
});
