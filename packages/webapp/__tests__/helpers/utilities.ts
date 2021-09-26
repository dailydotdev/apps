import { waitFor } from '@testing-library/preact';
import nock from 'nock';

export const expectNockDone = (): void => expect(nock.isDone()).toBeTruthy();

export const waitForNock = (): Promise<void> => waitFor(expectNockDone);
