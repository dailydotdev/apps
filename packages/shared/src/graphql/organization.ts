import { gql } from 'graphql-request';

export const ORGANIZATION_MEMBER_FRAGMENT = gql`
  fragment OrganizationMemberFragment on OrganizationMember {
    role
    user {
      id
      name
      username
      image
    }
  }
`;

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationFragment on Organization {
    id
    name
    image
    seats

    members {
      ...OrganizationMemberFragment
    }
  }

  ${ORGANIZATION_MEMBER_FRAGMENT}
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
