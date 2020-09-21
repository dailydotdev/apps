import { ParsedUrlQuery } from 'querystring';

export function shouldSkipSSR({ ssr }: ParsedUrlQuery): boolean {
  return ssr === 'false';
}
