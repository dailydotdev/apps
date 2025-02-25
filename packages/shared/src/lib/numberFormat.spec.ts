import { getPrice, removeNonNumber } from './numberFormat';
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
