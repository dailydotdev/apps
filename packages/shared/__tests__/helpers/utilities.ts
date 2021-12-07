import { act } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
import nock from 'nock';

export const expectNockDone = (): void => expect(nock.isDone()).toBeTruthy();

export const waitForNock = (): Promise<void> => waitFor(expectNockDone);

export const waitForRerender = (ms = 1): Promise<void> =>
  act(() => new Promise((resolve) => setTimeout(resolve, ms)));
