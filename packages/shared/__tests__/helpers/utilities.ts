import { waitFor } from '@testing-library/preact';
import nock from 'nock';

export const expectNockDone = (): void => expect(nock.isDone()).toBeTruthy();

export const waitForNock = (): Promise<void> => waitFor(expectNockDone);

export function expectToHaveAttribute(
  el: HTMLElement,
  att: string,
  value: string | null | undefined,
): Promise<void> {
  return waitFor(() => {
    if (value === 'false' || value === 'null') {
      return expect(el).not.toHaveAttribute(att);
    }
    return expect(el).toHaveAttribute(att, value);
  });
}

export function expectToHaveTestValue(
  el: HTMLElement,
  value: string | null | undefined,
): Promise<void> {
  return expectToHaveAttribute(el, 'data-test-value', value);
}
