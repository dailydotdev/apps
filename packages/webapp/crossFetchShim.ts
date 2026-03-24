const { fetch: globalFetch, Headers, Request, Response } = globalThis;

const fetchFn = globalFetch?.bind(globalThis);

export default fetchFn;
export const fetch = fetchFn;
export { Headers, Request, Response };
