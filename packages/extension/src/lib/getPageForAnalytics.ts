import { version } from '../../package.json';

export default function getPageForAnalytics(page: string): string {
  const prefix = '/extension';
  const suffix = `v=${version}&b=${process.env.TARGET_BROWSER}`;
  return `${prefix}${page}?${suffix}`;
}
