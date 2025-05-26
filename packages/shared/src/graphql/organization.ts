import { gql } from 'graphql-request';

export const ORGANIZATIONS_QUERY = gql`
  query Organizations {
    organizations {
      role
      referralToken
      organization {
        id
        name
        image
        seats
      }
    }
  }
`;
