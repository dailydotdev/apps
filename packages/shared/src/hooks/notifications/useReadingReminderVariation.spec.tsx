import { renderHook } from '@testing-library/react';
import { useConditionalFeature } from '../useConditionalFeature';
import {
  ReadingReminderVariation,
  useReadingReminderVariation,
} from './useReadingReminderVariation';

jest.mock('../useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

describe('useReadingReminderVariation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return hero variation', () => {
    (useConditionalFeature as jest.Mock).mockReturnValue({
      value: ReadingReminderVariation.Hero,
    });

    const { result } = renderHook(() => useReadingReminderVariation());

    expect(result.current.variation).toBe(ReadingReminderVariation.Hero);
    expect(result.current.isHero).toBe(true);
    expect(result.current.isInline).toBe(false);
  });

  it('should return inline variation', () => {
    (useConditionalFeature as jest.Mock).mockReturnValue({
      value: ReadingReminderVariation.Inline,
    });

    const { result } = renderHook(() => useReadingReminderVariation());

    expect(result.current.variation).toBe(ReadingReminderVariation.Inline);
    expect(result.current.isHero).toBe(false);
    expect(result.current.isInline).toBe(true);
  });

  it('should return control variation', () => {
    (useConditionalFeature as jest.Mock).mockReturnValue({
      value: ReadingReminderVariation.Control,
    });

    const { result } = renderHook(() => useReadingReminderVariation());

    expect(result.current.variation).toBe(ReadingReminderVariation.Control);
    expect(result.current.isControl).toBe(true);
    expect(result.current.isHero).toBe(false);
    expect(result.current.isInline).toBe(false);
  });

  it('should fall back to hero for invalid values', () => {
    (useConditionalFeature as jest.Mock).mockReturnValue({
      value: 'unexpected',
    });

    const { result } = renderHook(() => useReadingReminderVariation());

    expect(result.current.variation).toBe(ReadingReminderVariation.Control);
    expect(result.current.isControl).toBe(true);
    expect(result.current.isHero).toBe(false);
    expect(result.current.isInline).toBe(false);
  });
});
