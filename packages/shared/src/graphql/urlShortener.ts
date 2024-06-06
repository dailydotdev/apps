import { gql } from 'graphql-request';

export const GET_SHORT_URL_QUERY = gql`
  query GetShortUrl($url: String!) {
    getShortUrl(url: $url)
  }
`;
