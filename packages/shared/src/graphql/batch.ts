import { ClientError } from 'graphql-request';
import type { GraphQLError } from 'graphql-request/dist/types';
import { graphqlUrl } from '../lib/config';
import { gqlClient } from './common';

// The API rejects a longer array with a 400.
export const GQL_MAX_BATCH_SIZE = 10;

const BATCH_WINDOW = 10;
const BATCHING_STORAGE_KEY = 'dailydev:gqlBatching';

type BatchItem = {
  document: string;
  variables?: Record<string, unknown>;
  resolve: (data: unknown) => void;
  reject: (error: unknown) => void;
};

type BatchResponseItem = {
  data?: Record<string, unknown> | null;
  errors?: GraphQLError[];
};

let batchingEnabled = false;
let queue: BatchItem[] = [];
let flushHandle: ReturnType<typeof setTimeout> | undefined;

export const setGqlBatchingEnabled = (enabled: boolean): void => {
  batchingEnabled = enabled;
};

const getStorageOverride = (): boolean | undefined => {
  if (process.env.NODE_ENV === 'production') {
    return undefined;
  }

  try {
    const value = globalThis.localStorage?.getItem(BATCHING_STORAGE_KEY);

    if (value === '1') {
      return true;
    }

    if (value === '0') {
      return false;
    }
  } catch {
    // storage can throw in private mode
  }

  return undefined;
};

const isBatchingEnabled = (): boolean =>
  getStorageOverride() ?? batchingEnabled;

// Mirrors how the `unsetHeader` patch in `common.ts` reaches the client's own
// headers, so a batch carries the same auth/client headers a single request has.
const getClientHeaders = (): Record<string, string> => {
  const options = Reflect.get(gqlClient, 'options');
  const headers =
    options && typeof options === 'object'
      ? Reflect.get(options, 'headers')
      : undefined;

  if (!headers) {
    return {};
  }

  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    const plain: Record<string, string> = {};
    headers.forEach((value, key) => {
      plain[key] = value;
    });

    return plain;
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers as Array<[string, string]>);
  }

  if (typeof headers === 'object') {
    return { ...(headers as Record<string, string>) };
  }

  return {};
};

const operationNamePattern = /(?:query|mutation|subscription)\s+(\w+)/;

const getOperationName = (document: string): string | undefined =>
  document.match(operationNamePattern)?.[1];

const toClientError = (
  item: BatchItem,
  response: BatchResponseItem,
  status: number,
): ClientError =>
  new ClientError(
    { ...response, status },
    { query: item.document, variables: item.variables },
  );

const rejectBatch = (items: BatchItem[], status: number, message: string) => {
  items.forEach((item) => {
    item.reject(toClientError(item, { errors: [{ message }] }, status));
  });
};

const requestSingle = async (item: BatchItem): Promise<void> => {
  try {
    item.resolve(await gqlClient.request(item.document, item.variables));
  } catch (error) {
    item.reject(error);
  }
};

// A server without batching answers the array body with a plain object, so the
// items are retried one by one and the session stops sending arrays.
const fallbackToSingleRequests = async (items: BatchItem[]): Promise<void> => {
  setGqlBatchingEnabled(false);

  await Promise.all(items.map(requestSingle));
};

const flush = async (): Promise<void> => {
  flushHandle = undefined;

  const items = queue.slice(0, GQL_MAX_BATCH_SIZE);
  queue = queue.slice(GQL_MAX_BATCH_SIZE);

  // Anything over the API's cap waits for the next window.
  if (queue.length) {
    flushHandle = setTimeout(flush, BATCH_WINDOW);
  }

  if (!items.length) {
    return;
  }

  if (items.length === 1) {
    await requestSingle(items[0]);

    return;
  }

  const body = items.map(({ document, variables }) => {
    const operationName = getOperationName(document);

    return {
      query: document,
      variables,
      ...(operationName && { operationName }),
    };
  });

  let response: Response;

  try {
    response = await globalThis.fetch(graphqlUrl, {
      method: 'POST',
      credentials: 'include',
      headers: { ...getClientHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    rejectBatch(items, 0, (error as Error)?.message ?? 'Network error');

    return;
  }

  if (!response.ok) {
    rejectBatch(items, response.status, 'GraphQL batch request failed');

    return;
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  if (!Array.isArray(payload)) {
    await fallbackToSingleRequests(items);

    return;
  }

  if (payload.length !== items.length) {
    rejectBatch(items, response.status, 'Malformed GraphQL batch response');

    return;
  }

  const results = payload as BatchResponseItem[];

  items.forEach((item, index) => {
    const result = results[index];

    if (result?.data && !result.errors?.length) {
      item.resolve(result.data);

      return;
    }

    item.reject(toClientError(item, result ?? {}, response.status));
  });
};

const scheduleFlush = () => {
  if (flushHandle) {
    return;
  }

  flushHandle = setTimeout(flush, BATCH_WINDOW);
};

// Queries opt into this instead of `gqlClient.request` so several secondary
// requests fired in the same tick leave as one POST. Mutations never do.
export const gqlBatchRequest = <T>(
  document: string,
  variables?: Record<string, unknown>,
): Promise<T> => {
  if (typeof window === 'undefined' || !isBatchingEnabled()) {
    return gqlClient.request<T>(document, variables);
  }

  return new Promise<T>((resolve, reject) => {
    queue.push({
      document,
      variables,
      resolve: resolve as (data: unknown) => void,
      reject,
    });
    scheduleFlush();
  });
};
