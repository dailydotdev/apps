import { gql } from 'graphql-request';
import { USER_SHORT_INFO_FRAGMENT } from '../../graphql/fragments';

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
      referralUrl
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
      referralUrl
      organization {
        ...OrganizationFragment
      }
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

export const GET_ORGANIZATION_BY_ID_AND_INVITE_TOKEN_QUERY = gql`
  query GetOrganizationByIdAndInviteToken($id: ID!, $token: String!) {
    getOrganizationByIdAndInviteToken(id: $id, token: $token) {
      user {
        ...UserShortInfo
      }
      organization {
        id
        name
        image
        seats
      }
    }
  }

  ${USER_SHORT_INFO_FRAGMENT}
`;

export const UPDATE_ORGANIZATION_MUTATION = gql`
  mutation UpdateOrganization($id: ID!, $name: String, $image: Upload) {
    updateOrganization(id: $id, name: $name, image: $image) {
      role
      referralToken
      referralUrl
      organization {
        ...OrganizationFragment
      }
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

export const JOIN_ORGANIZATION_MUTATION = gql`
  mutation JoinOrganization($id: ID!, $token: String!) {
    joinOrganization(id: $id, token: $token) {
      role
      referralToken
      referralUrl
      organization {
        ...OrganizationFragment
      }
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;
