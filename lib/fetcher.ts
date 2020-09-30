export default async function fetcher(
  input: RequestInfo,
  init?: RequestInit,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const res = await fetch(input, {
    credentials: 'include',
    ...init,
  });
  return res.json();
}
