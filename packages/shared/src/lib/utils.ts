import { largeNumberFormat } from './numberFormat';

export const stringToBoolean = (value: string): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  return value.toLowerCase() === 'true';
};

export const formatCurrency = (value: number): string => {
  if (typeof value !== 'number') {
    return '';
  }

  return value.toLocaleString(['en-US'], {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const formatCoresCurrency = (value: number): string => {
  if (value > 100_000) {
    return largeNumberFormat(value);
  }

  return formatCurrency(value);
};
