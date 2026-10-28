import { useEffect, useRef, useState } from 'react';
import type { Source } from './data';
import { publications } from './data';

// NewSourceModal's steps, mocked: paste a link, "Check link" scrapes it,
// then the link either already is a source, fails to scrape, or offers its
// RSS feeds to pick from and submit for review. The scrape is drawn from
// the link itself, so every outcome can be reached by typing:
//
// - a known source's site (css-tricks.com, fireship) → already exists
// - anything with "fail" in it, or no dot → couldn't fetch, Contact
// - a link ending in feed, rss or xml → that one feed
// - any other site → its posts feed and its comments feed

export type SuggestStep =
  | 'idle'
  | 'checking'
  | 'feeds'
  | 'exists'
  | 'error'
  | 'submitting'
  | 'done';

export interface Feed {
  title: string;
  url: string;
}

const SCRAPE_MS = 900;
const SUBMIT_MS = 700;

const hostOf = (url: string): string =>
  url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#]/)[0];

const squash = (text: string): string => text.replace(/[^a-z0-9]/g, '');

export const isLink = (url: string): boolean => /\S+\.\S{2,}/.test(url.trim());

/** What the scrape finds for a link. */
export const resolveLink = (
  url: string,
):
  | { step: 'exists'; source: Source }
  | { step: 'error' }
  | { step: 'feeds'; feeds: Feed[] } => {
  const host = hostOf(url);
  const site = squash(host.replace(/\.[a-z]+$/, ''));
  const source =
    site.length > 2 &&
    publications.find(
      (item) =>
        squash(item.handle) === site ||
        squash(item.name.toLowerCase()) === site,
    );
  if (source) {
    return { step: 'exists', source };
  }
  if (!host.includes('.') || host.includes('fail')) {
    return { step: 'error' };
  }
  const name = host.replace(/\.[a-z]+$/, '');
  const title = name.charAt(0).toUpperCase() + name.slice(1);
  if (/(feed|rss|xml)\/?$/.test(url.trim())) {
    return { step: 'feeds', feeds: [{ title, url: url.trim() }] };
  }
  return {
    step: 'feeds',
    feeds: [
      { title: `${title} · Posts`, url: `https://${host}/feed` },
      { title: `${title} · Comments`, url: `https://${host}/comments/feed` },
    ],
  };
};

export interface SuggestFlow {
  url: string;
  setUrl: (url: string) => void;
  step: SuggestStep;
  canCheck: boolean;
  feeds: Feed[];
  selected: string | undefined;
  select: (url: string) => void;
  existing: Source | undefined;
  check: () => void;
  submit: () => void;
  /** From the feeds back to the link. */
  back: () => void;
  reset: () => void;
}

export const useSuggestFlow = ({
  initialUrl = '',
  initialStep,
  onSubmitted,
}: {
  initialUrl?: string;
  /** Opens on a step for the catalogs: the scrape of `initialUrl` decides. */
  initialStep?: SuggestStep;
  onSubmitted?: (feed: string) => void;
} = {}): SuggestFlow => {
  const initial = initialStep && initialUrl ? resolveLink(initialUrl) : null;
  const [url, setUrlState] = useState(initialUrl);
  const [step, setStep] = useState<SuggestStep>(
    initialStep === 'done' ? 'done' : initial?.step ?? 'idle',
  );
  const [feeds, setFeeds] = useState<Feed[]>(
    initial?.step === 'feeds' ? initial.feeds : [],
  );
  const [selected, setSelected] = useState<string | undefined>(
    initialStep === 'done' && initial?.step === 'feeds'
      ? initial.feeds[0].url
      : undefined,
  );
  const [existing, setExisting] = useState<Source | undefined>(
    initial?.step === 'exists' ? initial.source : undefined,
  );
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reset = () => {
    window.clearTimeout(timer.current);
    setStep('idle');
    setFeeds([]);
    setSelected(undefined);
    setExisting(undefined);
  };

  return {
    url,
    setUrl: (next) => {
      if (next === url) {
        return;
      }
      setUrlState(next);
      if (step !== 'idle') {
        reset();
      }
    },
    step,
    canCheck: isLink(url) && step !== 'checking',
    feeds,
    selected,
    select: setSelected,
    existing,
    check: () => {
      if (!isLink(url)) {
        return;
      }
      reset();
      setStep('checking');
      timer.current = window.setTimeout(() => {
        const result = resolveLink(url);
        if (result.step === 'exists') {
          setExisting(result.source);
        }
        if (result.step === 'feeds') {
          setFeeds(result.feeds);
          setSelected(
            result.feeds.length === 1 ? result.feeds[0].url : undefined,
          );
        }
        setStep(result.step);
      }, SCRAPE_MS);
    },
    submit: () => {
      if (!selected) {
        return;
      }
      setStep('submitting');
      timer.current = window.setTimeout(() => {
        setStep('done');
        onSubmitted?.(selected);
      }, SUBMIT_MS);
    },
    back: reset,
    reset: () => {
      reset();
      setUrlState('');
    },
  };
};
