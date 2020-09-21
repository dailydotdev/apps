import { ParsedUrlQuery } from 'querystring';

export interface SkipSSRProps {
  skipSSR: true;
}

export function shouldSkipSSR({ ssr }: ParsedUrlQuery): boolean {
  return ssr === 'false';
}
