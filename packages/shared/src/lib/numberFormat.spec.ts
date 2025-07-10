import { getPrice, removeNonNumber, formatDataTileValue } from './numberFormat';
import {
  dummyPaddleProductItemBrl,
  dummyPaddleProductItemDollar,
  dummyPaddleProductItemYen,
} from '../../__tests__/fixture/paddle';

describe('function removeNonNumber', () => {
  it('should remove all non-number characters from a string', () => {
    const value = '$1,234.56';
    const result = removeNonNumber(value);
    expect(result).toBe('1234.56');
    expect(removeNonNumber('R$119,90')).toBe('119.90');
    expect(removeNonNumber('¥5,880')).toBe('5880');
    expect(removeNonNumber('650.00 kr')).toBe('650.00');
  });

  it('should return the same value if there is no non-numeric character', () => {
    const value = '1234';
    const result = removeNonNumber(value);
    expect(result).toBe('1234');
  });
});

describe('function getPrice', () => {
  it('should divide by 100 when the returned price is not formatted correctly', () => {
    const result = getPrice(dummyPaddleProductItemDollar);
    expect(dummyPaddleProductItemDollar.formattedTotals.total).toBe('$14.49');
    expect(dummyPaddleProductItemDollar.totals.total).toBe('1449');
    expect(result).toEqual(14.49);
  });

  it('should handle fractional comma separator ', () => {
    const result = getPrice(dummyPaddleProductItemBrl);
    expect(dummyPaddleProductItemBrl.formattedTotals.total).toBe('R$119,90');
    expect(dummyPaddleProductItemBrl.totals.total).toBe('11990');
    expect(result).toEqual(119.9);
  });

  it('should return the price as is when the returned price is formatted correctly', () => {
    const result = getPrice(dummyPaddleProductItemYen);
    expect(dummyPaddleProductItemYen.formattedTotals.total).toBe('¥5,880');
    expect(dummyPaddleProductItemYen.totals.total).toBe('5880');
    expect(result).toEqual(5880);
  });

  it('should return the price when the value is low', () => {
    const dummy = structuredClone(dummyPaddleProductItemDollar);
    dummy.formattedTotals.total = '$0.99';
    dummy.totals.total = '99';
    const result = getPrice(dummy);
    expect(result).toEqual(0.99);
  });

  it('should return the price when the value is high', () => {
    const dummy = structuredClone(dummyPaddleProductItemDollar);
    dummy.formattedTotals.total = 'KD9999999';
    dummy.totals.total = '999999900';
    const result = getPrice(dummy);
    expect(result).toEqual(9999999);
  });
});

describe('function formatDataTileValue', () => {
  it('should format numbers less than 10,000 with locale formatting', () => {
    expect(formatDataTileValue(0)).toBe('0');
    expect(formatDataTileValue(1)).toBe('1');
    expect(formatDataTileValue(123)).toBe('123');
    expect(formatDataTileValue(1234)).toBe('1,234');
    expect(formatDataTileValue(9999)).toBe('9,999');
  });

  it('should format numbers 10,000 and above with large number formatting', () => {
    expect(formatDataTileValue(10000)).toBe('10.0k');
    expect(formatDataTileValue(15000)).toBe('15.0k');
    expect(formatDataTileValue(99999)).toBe('100.0k');
    expect(formatDataTileValue(100000)).toBe('100.0k');
    expect(formatDataTileValue(123456)).toBe('123.5k');
    expect(formatDataTileValue(1000000)).toBe('1.0M');
    expect(formatDataTileValue(1500000)).toBe('1.5M');
    expect(formatDataTileValue(1000000000)).toBe('1.0B');
  });

  it('should handle decimal precision correctly for large numbers', () => {
    expect(formatDataTileValue(10500)).toBe('10.5k');
    expect(formatDataTileValue(10050)).toBe('10.1k');
    expect(formatDataTileValue(10001)).toBe('10.0k');
    expect(formatDataTileValue(10049)).toBe('10.0k');
    expect(formatDataTileValue(10050)).toBe('10.1k');
  });

  it('should handle edge cases and invalid inputs', () => {
    expect(formatDataTileValue(NaN)).toBe('0');
    expect(formatDataTileValue(Infinity)).toBe('0');
    expect(formatDataTileValue(-Infinity)).toBe('0');
    expect(formatDataTileValue(-1234)).toBe('-1,234');
  });

  it('should handle very large numbers', () => {
    expect(formatDataTileValue(1000000000000)).toBe('1T');
    expect(formatDataTileValue(1500000000000)).toBe('1.5T');
  });

  it('should handle numbers exactly at the threshold', () => {
    expect(formatDataTileValue(9999)).toBe('9,999');
    expect(formatDataTileValue(10000)).toBe('10K');
  });
});
