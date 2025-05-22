import { gql } from 'graphql-request';

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationFragment on Organization {
    id
    name
    image
    seats
  }
`;

export const ORGANIZATIONS_QUERY = gql`
  query Organizations {
    organizations {
      role
      referralToken
      organization {
        ...OrganizationFragment
      }
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

export const ORGANIZATION_QUERY = gql`
  query Organization($id: ID!) {
    organization(id: $id) {
      role
      referralToken
      organization {
        ...OrganizationFragment
      }
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;
