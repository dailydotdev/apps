import type { Origin } from './lib/log';

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
  question: string;
  answer: React.ReactNode;
};

export enum PostType {
  Article = 'article',
  Share = 'share',
  Welcome = 'welcome',
  Freeform = 'freeform',
  VideoYouTube = 'video:youtube',
  Collection = 'collection',
  Brief = 'brief',
}

export const briefSourcesLimit = 6;
