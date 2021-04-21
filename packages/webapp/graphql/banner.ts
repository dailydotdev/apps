import { gql } from 'graphql-request';

export type Banner = {
  timestamp: string;
  cta: string;
  subtitle: string;
  theme: 'title-bacon' | 'gradient-bacon-onion' | 'cta-bacon-onion';
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
