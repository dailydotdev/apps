import React from 'react';
import { renderHook, RenderResult } from '@testing-library/preact-hooks';
import { QueryClient, QueryClientProvider } from 'react-query';
import { waitFor } from '@testing-library/preact';
import nock from 'nock';
import { TutorialKey, UseTutorial, useTutorial } from './useTutorial';

const createWrapper = ({ client }: { client: QueryClient }) => {
  const Wrapper = ({ children }) => {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };

  return Wrapper;
};

const waitForCompletedValue = ({
  client,
  result,
  toBe,
}: {
  client: QueryClient;
  result: RenderResult<UseTutorial>;
  toBe: boolean;
}) => {
  return waitFor(() => {
    const value = client.getQueryData([
      `tutorial-${TutorialKey.SeenNewSquadTooltip}`,
      false,
    ]);

    expect(value).toBe(toBe);
    expect(result.current.isCompleted).toBe(toBe);
  });
};

const client = new QueryClient();

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  client.clear();
});

it('should return the tutorial state', async () => {
  const { result } = renderHook(
    () => useTutorial({ key: TutorialKey.SeenNewSquadTooltip }),
    { wrapper: createWrapper({ client }) },
  );

  expect(result.current.isActive).toBe(false);
  await waitForCompletedValue({ client, result, toBe: false });
});

it('should activate tutorial', async () => {
  const { result, rerender } = renderHook(
    () => useTutorial({ key: TutorialKey.SeenNewSquadTooltip }),
    { wrapper: createWrapper({ client }) },
  );

  result.current.activate();
  rerender();

  expect(result.current.isActive).toBe(true);
  await waitForCompletedValue({ client, result, toBe: false });
});

it('should complete tutorial', async () => {
  const { result } = renderHook(
    () => useTutorial({ key: TutorialKey.SeenNewSquadTooltip }),
    { wrapper: createWrapper({ client }) },
  );

  await waitForCompletedValue({ client, result, toBe: false });

  result.current.complete();

  expect(result.current.isActive).toBe(false);
  await waitForCompletedValue({ client, result, toBe: true });
});

it('should reset tutorial', async () => {
  const { result } = renderHook(
    () => useTutorial({ key: TutorialKey.SeenNewSquadTooltip }),
    { wrapper: createWrapper({ client }) },
  );

  await waitForCompletedValue({ client, result, toBe: false });

  result.current.complete();
  await waitForCompletedValue({ client, result, toBe: true });

  result.current.reset();

  expect(result.current.isActive).toBe(false);
  await waitForCompletedValue({ client, result, toBe: false });
});

it('should not activate if tutorial is completed', async () => {
  const { result, rerender } = renderHook(
    () => useTutorial({ key: TutorialKey.SeenNewSquadTooltip }),
    { wrapper: createWrapper({ client }) },
  );

  await waitForCompletedValue({ client, result, toBe: false });

  result.current.complete();
  await waitForCompletedValue({ client, result, toBe: true });

  result.current.activate();
  rerender();

  expect(result.current.isActive).toBe(false);
});
