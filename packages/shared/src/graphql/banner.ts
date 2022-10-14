import { gql } from 'graphql-request';
import { Theme } from '../components/utilities';

export enum BannerCustomTheme {
  cabbageOnion = 'cabbage-onion',
  whitePepper = 'whitePepper',
}

export type BannerTheme = Theme | BannerCustomTheme;

export type Banner = {
  timestamp: string;
  cta: string;
  subtitle: string;
  theme: BannerTheme;
  title: string;
  url: string;
};

export type BannerData = { banner: Banner };

export const BANNER_QUERY = gql`
  query Banner($lastSeen: DateTime) {
    banner(lastSeen: $lastSeen) {
      timestamp
      cta
      subtitle
      theme
      title
      url
    }
  }
`;
