import '@testing-library/jest-dom';
import { matchers } from '@emotion/jest';
import ReactGA from 'react-ga';
import 'fake-indexeddb/auto';
import nodeFetch from 'node-fetch';

expect.extend(matchers);

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
      ): [any, (value: any) => Promise<void>, boolean] => [
        valueWhenCacheEmpty,
        jest.fn().mockResolvedValue(undefined),
        true,
      ],
    ),
}));

jest.mock('next/dynamic', () => (func: () => Promise<any>) => {
  let component: any = null;
  func().then((module: any) => {
    component = module.default;
  });
  const DynamicComponent = (...args) => component(...args);
  DynamicComponent.displayName = 'LoadableComponent';
  DynamicComponent.preload = jest.fn();
  return DynamicComponent;
});

global.fetch = (nodeFetch as any) as typeof fetch;
/* eslint-enable @typescript-eslint/no-explicit-any */

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
});

Object.defineProperty(global, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
});

Object.defineProperty(global, 'scroll', {
  writable: true,
  value: jest.fn(),
});
