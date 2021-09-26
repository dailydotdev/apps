import { waitFor } from '@testing-library/preact';
import nock from 'nock';

export const waitForNock = (): Promise<void> =>
  waitFor(() => expect(nock.isDone()).toBeTruthy());
