import { getLogErrorDetails } from './errors';

describe('getLogErrorDetails', () => {
  it('keeps what JSON.stringify drops from an Error', () => {
    const error = Object.assign(new TypeError('Card declined'), {
      code: 'card_declined',
    });

    expect(JSON.stringify({ error })).toEqual(
      '{"error":{"code":"card_declined"}}',
    );
    expect(getLogErrorDetails(error)).toEqual({
      message: 'Card declined',
      name: 'TypeError',
      code: 'card_declined',
    });
  });

  it('reads plain error objects and primitives', () => {
    expect(
      getLogErrorDetails({ type: 'checkout_error', code: 'x', detail: 'y' }),
    ).toEqual({ message: 'y', name: 'checkout_error', code: 'x' });
    expect(getLogErrorDetails('blocked')).toEqual({ message: 'blocked' });
    expect(getLogErrorDetails(500)).toEqual({ message: '500' });
  });

  it('returns nothing when there is nothing to log', () => {
    expect(getLogErrorDetails(undefined)).toBeUndefined();
    expect(getLogErrorDetails(null)).toBeUndefined();
    expect(getLogErrorDetails('')).toBeUndefined();
    expect(getLogErrorDetails({ id: 'v1' })).toBeUndefined();
  });

  it('caps long messages', () => {
    expect(getLogErrorDetails('a'.repeat(600))?.message).toHaveLength(500);
  });
});
