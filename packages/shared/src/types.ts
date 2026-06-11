import type { Origin } from './lib/log';
import type { PostHeroSignificance } from './graphql/types';

export type PropsParameters<
  T extends (props: Record<string, unknown>) => unknown,
> = T extends (props: infer P) => unknown ? P : never;

declare module 'graphql-request' {
  export interface GraphQLClient {
    unsetHeader(header: string): GraphQLClient;
  }
}

export type LogStartBuyingCreditsProps = {
  origin: Origin;
  target_id?: string;
  amount?: number;
};

export type FAQItem = {
  title: string;
  description: React.ReactNode;
};

export enum PostType {
  Article = 'article',
  Share = 'share',
  Welcome = 'welcome',
  Freeform = 'freeform',
  VideoYouTube = 'video:youtube',
  Collection = 'collection',
  Brief = 'brief',
  Poll = 'poll',
  SocialTwitter = 'social:twitter',
  Digest = 'digest',
  LiveRoom = 'live_room',
}

export const briefSourcesLimit = 6;

export const BRIEFING_SOURCE = 'briefing';

export type ErrorBoundaryFeature =
  | 'recruiter-self-serve'
  | 'extension-feed'
  | 'onboarding'
  | '404-page';

export const GSI_SRC = 'https://accounts.google.com/gsi/client';
export const GSI_SCRIPT_ID = 'google-gsi-client';

export type HeroCardsConfig = {
  enabled: boolean;
  minSpacing: number;
  /**
   * Items at indices `[0, startIndex)` are forced to colSpan 1 regardless
   * of hero significance. Prevents wide cards from displacing the first
   * ad slot (defaults to 4 so a wide card cannot appear before the ad at
   * index 2).
   */
  startIndex: number;
  chipLabels: Partial<Record<PostHeroSignificance, string>>;
};
