import { gql } from 'graphql-request';

export const RECOMMEND_ARTICLE_MUTATION = gql`
  mutation SubmitArticle($url: String!) {
    submitArticle(url: $url) {
      _
    }
  }
`;
