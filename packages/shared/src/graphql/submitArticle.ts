import { gql } from 'graphql-request';

export const SUBMIT_ARTICLE_MUTATION = gql`
  mutation SubmitArticle($url: String!) {
    submitArticle(url: $url) {
      _
    }
  }
`;
