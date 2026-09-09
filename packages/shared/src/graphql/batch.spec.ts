import nock from 'nock';
import type { ApiErrorResult } from './common';
import { ApiError, getApiError } from './common';
import { gqlBatchRequest, setGqlBatchingEnabled } from './batch';

const QUERY_A = `query A {
  a
}`;
const QUERY_B = `query B {
  b
}`;

const apiUrl = 'http://localhost:3000';

let bodies: unknown[] = [];

const recordBody = (body: unknown): boolean => {
  bodies.push(body);

  return true;
};

beforeEach(() => {
  nock.cleanAll();
  bodies = [];
  setGqlBatchingEnabled(false);
});

afterEach(() => {
  setGqlBatchingEnabled(false);
});

describe('gqlBatchRequest', () => {
  it('sends one request for calls made in the same window', async () => {
    setGqlBatchingEnabled(true);
    nock(apiUrl)
      .post('/graphql', recordBody)
      .reply(200, [{ data: { a: 1 } }, { data: { b: 2 } }]);

    const [first, second] = await Promise.all([
      gqlBatchRequest<{ a: number }>(QUERY_A),
      gqlBatchRequest<{ b: number }>(QUERY_B),
    ]);

    expect(bodies).toHaveLength(1);
    expect(bodies[0]).toEqual([
      { query: QUERY_A, operationName: 'A' },
      { query: QUERY_B, operationName: 'B' },
    ]);
    expect(first).toEqual({ a: 1 });
    expect(second).toEqual({ b: 2 });
  });

  it('rejects only the item that returned errors', async () => {
    setGqlBatchingEnabled(true);
    nock(apiUrl)
      .post('/graphql', recordBody)
      .reply(200, [
        { data: { a: 1 } },
        {
          errors: [
            { message: 'Not found', extensions: { code: ApiError.NotFound } },
          ],
        },
      ]);

    const results = await Promise.allSettled([
      gqlBatchRequest<{ a: number }>(QUERY_A),
      gqlBatchRequest<{ b: number }>(QUERY_B),
    ]);

    expect(results[0]).toMatchObject({ status: 'fulfilled', value: { a: 1 } });
    expect(results[1].status).toEqual('rejected');

    const { reason } = results[1] as PromiseRejectedResult;

    expect(
      getApiError(reason as ApiErrorResult, ApiError.NotFound)?.message,
    ).toEqual('Not found');
  });

  it('sends a request per call while batching is off', async () => {
    nock(apiUrl)
      .post('/graphql', recordBody)
      .reply(200, { data: { a: 1 } });
    nock(apiUrl)
      .post('/graphql', recordBody)
      .reply(200, { data: { b: 2 } });

    await Promise.all([
      gqlBatchRequest<{ a: number }>(QUERY_A),
      gqlBatchRequest<{ b: number }>(QUERY_B),
    ]);

    expect(bodies).toHaveLength(2);
    expect(bodies.every((body) => !Array.isArray(body))).toBe(true);
  });

  it('falls back to single requests when the server rejects the array body', async () => {
    setGqlBatchingEnabled(true);
    nock(apiUrl)
      .post('/graphql', recordBody)
      .reply(200, { errors: [{ message: 'body must be object' }] });
    nock(apiUrl)
      .post('/graphql', recordBody)
      .reply(200, { data: { a: 1 } });
    nock(apiUrl)
      .post('/graphql', recordBody)
      .reply(200, { data: { b: 2 } });

    const [first, second] = await Promise.all([
      gqlBatchRequest<{ a: number }>(QUERY_A),
      gqlBatchRequest<{ b: number }>(QUERY_B),
    ]);

    expect(first).toEqual({ a: 1 });
    expect(second).toEqual({ b: 2 });
    expect(bodies).toHaveLength(3);
    expect(Array.isArray(bodies[0])).toBe(true);
    expect(bodies.slice(1).every((body) => !Array.isArray(body))).toBe(true);

    nock(apiUrl)
      .post('/graphql', recordBody)
      .reply(200, { data: { a: 3 } });

    const third = await gqlBatchRequest<{ a: number }>(QUERY_A);

    expect(third).toEqual({ a: 3 });
    expect(bodies).toHaveLength(4);
    expect(Array.isArray(bodies[3])).toBe(false);
  });

  it('splits a queue longer than the batch limit', async () => {
    setGqlBatchingEnabled(true);
    nock(apiUrl)
      .post('/graphql', recordBody)
      .reply(
        200,
        Array.from({ length: 10 }, (_, index) => ({ data: { a: index } })),
      );
    nock(apiUrl)
      .post('/graphql', recordBody)
      .reply(200, { data: { a: 10 } });

    const results = await Promise.all(
      Array.from({ length: 11 }, () => gqlBatchRequest<{ a: number }>(QUERY_A)),
    );

    expect(bodies).toHaveLength(2);
    expect(bodies[0]).toHaveLength(10);
    expect(Array.isArray(bodies[1])).toBe(false);
    expect(results[10]).toEqual({ a: 10 });
  });
});
