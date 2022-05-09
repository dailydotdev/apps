import { gql } from 'graphql-request';

export const RECOMMEND_ARTICLE_MUTATION = gql`
  mutation RecommendArticle($data: String!) {
    submitArticle(data: $data)
  }
`;
