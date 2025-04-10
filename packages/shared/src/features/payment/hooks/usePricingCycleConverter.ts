import { useMemo } from 'react';
import type { PricePreviewResponse } from '@paddle/paddle-js';
import type { LineItem } from '@paddle/paddle-js/types/price-preview/price-preview';
import parseCurrency from 'parsecurrency';

export type PricingFormat = {
  priceId: string;
  price: string;
};

type UsePricingCycleConverterProps = {
  pricePreview: PricePreviewResponse | null;
  locale?: string;
};

const convertPrice = (item: LineItem, locale: string): string => {
  const parsed = parseCurrency(item.formattedTotals.total);

  let periodInDays = 30;
  if (item.price?.billingCycle?.interval === 'year') {
    periodInDays = 365;
  }

  const dailyAmount = parsed.value / periodInDays;

  // Format the daily amount based on the locale and currency
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: parsed.decimals ? parsed.decimals.length - 1 : 0,
    maximumFractionDigits: parsed.decimals ? parsed.decimals.length - 1 : 0,
  });

  // Format the daily amount
  let formattedDailyAmount = formatter.format(dailyAmount);

  // Use regex to replace the numeric part while preserving the symbol and its position
  const numericRegex = /[\d.,]+/;
  formattedDailyAmount = item.formattedTotals.total.replace(
    numericRegex,
    formattedDailyAmount,
  );

  return formattedDailyAmount;
};

export const usePricingCycleConverter = ({
  pricePreview,
  locale = globalThis?.navigator?.language ?? 'en-US',
}: UsePricingCycleConverterProps): Record<string, PricingFormat> => {
  return useMemo(() => {
    if (!pricePreview?.data) {
      return {};
    }

    const { data } = pricePreview;

    return data.details?.lineItems?.map((item) => {
      const priceId = item.price.id;

      return {
        priceId,
        price: convertPrice(item, locale),
      };
    });
  }, [pricePreview, locale]);
};
