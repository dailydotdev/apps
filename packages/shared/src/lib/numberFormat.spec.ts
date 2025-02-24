import { getPrice, removeNonNumber } from './numberFormat';
import {
  dummyPaddleProductItemDollar,
  dummyPaddleProductItemYen,
} from '../../__tests__/fixture/paddle';

describe('function removeNonNumber', () => {
  it('should remove all non-number characters from a string', () => {
    const value = '$1,234.56';
    const result = removeNonNumber(value);
    expect(result).toBe('1234.56');
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

  it('should return the price as is when the returned price is formatted correctly', () => {
    const result = getPrice(dummyPaddleProductItemYen);
    expect(dummyPaddleProductItemYen.formattedTotals.total).toBe('¥5,880');
    expect(dummyPaddleProductItemYen.totals.total).toBe('5880');
    expect(result).toEqual(5880);
  });
});
