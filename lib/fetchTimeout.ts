export default function fetchTimeout(
  url: string,
  ms: number,
  { signal, ...options }: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const promise = fetch(url, { signal: controller.signal, ...options });
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }
  const timeout = setTimeout(() => controller.abort(), ms);
  return promise.finally(() => clearTimeout(timeout));
}
