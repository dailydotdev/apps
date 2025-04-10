import { renderHook } from '@testing-library/react';
import type { PricePreviewResponse } from '@paddle/paddle-js';
import { usePricingCycleConverter } from './usePricingCycleConverter';

describe('usePricingCycleConverter', () => {
  // Helper function to create mock price preview data
  const createMockPricePreview = (
    items: Array<{
      priceId: string;
      formattedTotal: string;
      total: string;
      interval?: 'month' | 'year';
    }>,
    currencyCode = 'USD',
  ): { data: Partial<PricePreviewResponse['data']> } => {
    return {
      data: {
        currencyCode,
        details: {
          lineItems: items.map((item) => ({
            price: {
              id: item.priceId,
              billingCycle: {
                interval: item.interval || 'month',
                frequency: 1,
              },
            },
            formattedTotals: {
              total: item.formattedTotal,
            },
            totals: {
              total: item.total,
            },
          })),
        },
      },
    };
  };

  it('should return empty object when price preview is null', () => {
    const { result } = renderHook(() =>
      usePricingCycleConverter({ pricePreview: null }),
    );
    expect(result.current).toEqual({});
  });

  it('should return empty object when price preview data is undefined', () => {
    const { result } = renderHook(() =>
      usePricingCycleConverter({
        pricePreview: { data: undefined } as Partial<PricePreviewResponse>,
      }),
    );
    expect(result.current).toEqual({});
  });

  it('should convert monthly prices to daily prices in USD', () => {
    const mockPreview = createMockPricePreview([
      {
        priceId: 'price_monthly',
        formattedTotal: '$14.99',
        total: '1499',
        interval: 'month',
      },
    ]);

    const { result } = renderHook(() =>
      usePricingCycleConverter({
        pricePreview: mockPreview as PricePreviewResponse,
        locale: 'en-US',
      }),
    );

    expect(result.current).toEqual([
      {
        priceId: 'price_monthly',
        price: '$0.50',
      },
    ]);
  });

  it('should convert yearly prices to daily prices in USD', () => {
    const mockPreview = createMockPricePreview([
      {
        priceId: 'price_yearly',
        formattedTotal: '$120.00',
        total: '12000',
        interval: 'year',
      },
    ]);

    const { result } = renderHook(() =>
      usePricingCycleConverter({
        pricePreview: mockPreview as PricePreviewResponse,
        locale: 'en-US',
      }),
    );

    expect(result.current).toEqual([
      {
        priceId: 'price_yearly',
        price: '$0.33',
      },
    ]);
  });

  it('should handle multiple prices with different billing cycles', () => {
    const mockPreview = createMockPricePreview([
      {
        priceId: 'price_monthly',
        formattedTotal: '$14.99',
        total: '1499',
        interval: 'month',
      },
      {
        priceId: 'price_yearly',
        formattedTotal: '$120.00',
        total: '12000',
        interval: 'year',
      },
    ]);

    const { result } = renderHook(() =>
      usePricingCycleConverter({
        pricePreview: mockPreview as PricePreviewResponse,
        locale: 'en-US',
      }),
    );

    expect(result.current).toEqual([
      {
        priceId: 'price_monthly',
        price: '$0.50',
      },
      {
        priceId: 'price_yearly',
        price: '$0.33',
      },
    ]);
  });

  it('should handle Japanese Yen currency (no decimal places)', () => {
    const mockPreview = createMockPricePreview(
      [
        {
          priceId: 'price_monthly',
          formattedTotal: '¥1,500',
          total: '1500',
          interval: 'month',
        },
      ],
      'JPY',
    );

    const { result } = renderHook(() =>
      usePricingCycleConverter({
        pricePreview: mockPreview as PricePreviewResponse,
        locale: 'ja-JP',
      }),
    );

    expect(result.current).toEqual([
      {
        priceId: 'price_monthly',
        price: '¥50',
      },
    ]);
  });

  it('should handle Indian Rupee with special formatting', () => {
    const mockPreview = createMockPricePreview(
      [
        {
          priceId: 'price_monthly',
          formattedTotal: '₹1,499.00',
          total: '149900',
          interval: 'month',
        },
      ],
      'INR',
    );

    const { result } = renderHook(() =>
      usePricingCycleConverter({
        pricePreview: mockPreview as PricePreviewResponse,
        locale: 'en-IN',
      }),
    );

    expect(result.current).toEqual([
      {
        priceId: 'price_monthly',
        price: '₹49.97',
      },
    ]);
  });

  it('should handle currencies with symbols after the amount', () => {
    const mockPreview = createMockPricePreview(
      [
        {
          priceId: 'price_monthly',
          formattedTotal: '1499,00 kr',
          total: '149900',
          interval: 'month',
        },
      ],
      'SEK',
    );

    const { result } = renderHook(() =>
      usePricingCycleConverter({
        pricePreview: mockPreview as PricePreviewResponse,
        locale: 'sv-SE',
      }),
    );

    expect(result.current).toEqual([
      {
        priceId: 'price_monthly',
        price: '49,97 kr',
      },
    ]);
  });

  it('should handle currency format edge case with spaces', () => {
    const mockPreview = createMockPricePreview(
      [
        {
          priceId: 'price_monthly',
          formattedTotal: 'R$ 149,90', // Brazilian Real with space after symbol
          total: '14990',
          interval: 'month',
        },
      ],
      'BRL',
    );

    const { result } = renderHook(() =>
      usePricingCycleConverter({
        pricePreview: mockPreview as PricePreviewResponse,
        locale: 'pt-BR',
      }),
    );

    expect(result.current).toEqual([
      {
        priceId: 'price_monthly',
        price: 'R$ 5,00',
      },
    ]);
  });
});
