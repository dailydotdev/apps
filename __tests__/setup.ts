import '@testing-library/jest-dom';
import 'jest-styled-components';
import ReactGA from 'react-ga';
import 'fake-indexeddb/auto';

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
ReactGA.initialize('foo', { testMode: true });

/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('../lib/usePersistentState', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(
      (
        key: string,
        initialValue: any,
        valueWhenCacheEmpty: any,
      ): [any, (value: any) => Promise<void>] => [
        valueWhenCacheEmpty,
        jest.fn().mockResolvedValue(undefined),
      ],
    ),
}));
/* eslint-enable @typescript-eslint/no-explicit-any */
