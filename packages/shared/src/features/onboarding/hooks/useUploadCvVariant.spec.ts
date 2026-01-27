/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { useUploadCvVariant } from './useUploadCvVariant';
import { useFeature } from '../../../components/GrowthBookProvider';
import { uploadCvVariants } from '../steps/uploadCvVariants';

jest.mock('../../../components/GrowthBookProvider', () => ({
  useFeature: jest.fn(),
}));

const mockUseFeature = useFeature as jest.MockedFunction<typeof useFeature>;

describe('useUploadCvVariant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return v1 (control) variant when feature flag is 1', () => {
    mockUseFeature.mockReturnValue(1);

    const { result } = renderHook(() => useUploadCvVariant());

    expect(result.current).toEqual(uploadCvVariants[1]);
    expect(result.current.headline).toBe('');
    expect(result.current.description).toBe('');
  });

  it('should return v2 variant when feature flag is 2', () => {
    mockUseFeature.mockReturnValue(2);

    const { result } = renderHook(() => useUploadCvVariant());

    expect(result.current).toEqual(uploadCvVariants[2]);
    expect(result.current.headline).toBe(
      'Get matched with jobs that fit your skills',
    );
    expect(result.current.description).toBe(
      "Upload your CV and we'll surface relevant opportunities from companies hiring developers like you. No searching required.",
    );
  });

  it('should return v3 variant when feature flag is 3', () => {
    mockUseFeature.mockReturnValue(3);

    const { result } = renderHook(() => useUploadCvVariant());

    expect(result.current).toEqual(uploadCvVariants[3]);
    expect(result.current.headline).toBe('Let opportunities find you');
    expect(result.current.description).toBe(
      "Your CV helps us show you relevant roles while you browse your feed. Great jobs, zero effort — we'll notify you when something matches.",
    );
  });

  it('should fall back to v1 when feature flag returns unknown version', () => {
    mockUseFeature.mockReturnValue(999);

    const { result } = renderHook(() => useUploadCvVariant());

    expect(result.current).toEqual(uploadCvVariants[1]);
  });

  it('should fall back to v1 when feature flag returns 0', () => {
    mockUseFeature.mockReturnValue(0);

    const { result } = renderHook(() => useUploadCvVariant());

    expect(result.current).toEqual(uploadCvVariants[1]);
  });
});
