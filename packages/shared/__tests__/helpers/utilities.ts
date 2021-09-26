import { waitFor } from '@testing-library/react';
import nock from 'nock';

export const expectNockDone = (): void => expect(nock.isDone()).toBeTruthy();

export const waitForNock = (): Promise<void> => waitFor(expectNockDone);
