import { largeNumberFormat } from './numberFormat';
import type { TLocation } from '../graphql/autocomplete';

export const stringToBoolean = (value: string): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  return value.toLowerCase() === 'true';
};

export const formatCurrency = (
  value: number,
  options?: Intl.NumberFormatOptions,
): string => {
  if (typeof value !== 'number') {
    return '';
  }

  return value.toLocaleString(['en-US'], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
};

export const formatCoresCurrency = (value: number): string => {
  if (value > 100_000) {
    return largeNumberFormat(value);
  }

  return formatCurrency(value, {
    minimumFractionDigits: 0,
  });
};

export const formatOrganizationSubscriptionPreviewCurrency = ({
  currency,
  amount,
}: {
  currency: string;
  amount: number;
}): string => {
  return new Intl.NumberFormat(navigator.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
    currency,
  }).format(amount);
};

export const snapToHalf = (v: number): 0.0 | 0.5 | 1.0 => {
  const x = Math.min(1, Math.max(0, v));

  if (x < 0.25) {
    return 0.0;
  }
  if (x < 0.75) {
    return 0.5;
  }

  return 1.0;
};

export const locationToString = (loc: TLocation) => {
  if (!loc) {
    return undefined;
  }

  return [loc.city, loc.subdivision, loc.country].filter(Boolean).join(', ');
};

export const excludeProperties = <
  T,
  K extends string | keyof T,
  R = Omit<T, K & keyof T>,
>(
  obj: T,
  properties: K[],
): R => {
  if (!obj) {
    return obj as unknown as R;
  }

  const clone = structuredClone(obj);

  properties.forEach((prop) => {
    delete (clone as Record<string, unknown>)[prop as string];
  });

  return clone as unknown as R;
};
