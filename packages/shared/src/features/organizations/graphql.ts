import { gql } from 'graphql-request';
import { USER_SHORT_INFO_FRAGMENT } from '../../graphql/fragments';
import { PRICING_METADATA_FRAGMENT } from '../../graphql/paddle';

export const ORGANIZATION_MEMBER_FRAGMENT = gql`
  fragment OrganizationMemberFragment on OrganizationMember {
    role
    seatType
    lastActive
    user {
      id
      name
      username
      image
      isPlus
    }
  }
`;

export const ORGANIZATION_SHORT_FRAGMENT = gql`
  fragment OrganizationShortFragment on Organization {
    id
    name
    image
  }
`;

export const ORGANIZATION_BASE_FRAGMENT = gql`
  fragment OrganizationBaseFragment on Organization {
    ...OrganizationShortFragment
    seats
    activeSeats
    status
  }

  ${ORGANIZATION_SHORT_FRAGMENT}
`;

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationFragment on Organization {
    ...OrganizationBaseFragment
    members {
      ...OrganizationMemberFragment
    }
  }

  ${ORGANIZATION_BASE_FRAGMENT}
  ${ORGANIZATION_MEMBER_FRAGMENT}
`;

export const USER_ORGANIZATION_BASE_FRAGMENT = gql`
  fragment UserOrganizationBaseFragment on UserOrganization {
    role
    referralToken
    seatType
  }
`;

export const USER_ORGANIZATION_FRAGMENT = gql`
  fragment UserOrganizationFragment on UserOrganization {
    ...UserOrganizationBaseFragment
    referralUrl
  }

  ${USER_ORGANIZATION_BASE_FRAGMENT}
`;

export const ORGANIZATIONS_BASE_QUERY = gql`
  query OrganizationsBase {
    organizations {
      ...UserOrganizationBaseFragment
      organization {
        ...OrganizationShortFragment
      }
    }
  }
  ${USER_ORGANIZATION_BASE_FRAGMENT}
  ${ORGANIZATION_SHORT_FRAGMENT}
`;

export const ORGANIZATION_BASE_QUERY = gql`
  query OrganizationBase($id: ID!) {
    organization(id: $id) {
      ...UserOrganizationBaseFragment
      organization {
        ...OrganizationBaseFragment
      }
    }
  }
  ${USER_ORGANIZATION_BASE_FRAGMENT}
  ${ORGANIZATION_BASE_FRAGMENT}
`;

export const ORGANIZATIONS_QUERY = gql`
  query Organizations {
    organizations {
      ...UserOrganizationFragment
      organization {
        ...OrganizationFragment
      }
    }
  }
  ${USER_ORGANIZATION_FRAGMENT}
  ${ORGANIZATION_FRAGMENT}
`;

export const ORGANIZATION_QUERY = gql`
  query Organization($id: ID!) {
    organization(id: $id) {
      ...UserOrganizationFragment
      organization {
        ...OrganizationFragment
      }
    }
  }
  ${USER_ORGANIZATION_FRAGMENT}
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
        activeSeats
      }
    }
  }

  ${USER_SHORT_INFO_FRAGMENT}
`;

export const UPDATE_ORGANIZATION_MUTATION = gql`
  mutation UpdateOrganization($id: ID!, $name: String, $image: Upload) {
    updateOrganization(id: $id, name: $name, image: $image) {
      ...UserOrganizationBaseFragment
      organization {
        ...OrganizationBaseFragment
      }
    }
  }
  ${USER_ORGANIZATION_BASE_FRAGMENT}
  ${ORGANIZATION_BASE_FRAGMENT}
`;

export const JOIN_ORGANIZATION_MUTATION = gql`
  mutation JoinOrganization($id: ID!, $token: String!) {
    joinOrganization(id: $id, token: $token) {
      ...UserOrganizationBaseFragment
      organization {
        ...OrganizationBaseFragment
      }
    }
  }
  ${USER_ORGANIZATION_BASE_FRAGMENT}
  ${ORGANIZATION_BASE_FRAGMENT}
`;

export const LEAVE_ORGANIZATION_MUTATION = gql`
  mutation LeaveOrganization($id: ID!) {
    leaveOrganization(id: $id) {
      _
    }
  }
`;

export const UPDATE_ORGANIZATION_SUBSCRIPTION_MUTATION = gql`
  mutation UpdateOrganizationSubscription($id: ID!, $quantity: Int!) {
    updateOrganizationSubscription(id: $id, quantity: $quantity) {
      ...UserOrganizationBaseFragment
      organization {
        ...OrganizationBaseFragment
      }
    }
  }
  ${USER_ORGANIZATION_BASE_FRAGMENT}
  ${ORGANIZATION_BASE_FRAGMENT}
`;

export const PREVIEW_SUBSCRIPTION_UPDATE_QUERY = gql`
  query PreviewOrganizationSubscriptionUpdate(
    $id: ID!
    $quantity: Int!
    $locale: String
  ) {
    previewOrganizationSubscriptionUpdate(
      id: $id
      quantity: $quantity
      locale: $locale
    ) {
      pricing {
        priceId
        duration
        currency {
          code
        }
        price {
          amount
          monthly {
            amount
          }
        }
        metadata {
          ...PricingMetadataFragment
        }
      }
      nextBilling
      total {
        amount
      }
      prorated {
        total {
          amount
        }
        tax {
          amount
        }
        subTotal {
          amount
        }
      }
    }
  }

  ${PRICING_METADATA_FRAGMENT}
`;

export const DELETE_ORGANIZATION_MUTATION = gql`
  mutation DeleteOrganization($id: ID!) {
    deleteOrganization(id: $id) {
      _
    }
  }
`;

export const REMOVE_ORGANIZATION_MEMBER_MUTATION = gql`
  mutation RemoveOrganizationMember($id: ID!, $memberId: String!) {
    removeOrganizationMember(id: $id, memberId: $memberId) {
      ...UserOrganizationFragment
      organization {
        ...OrganizationFragment
      }
    }
  }

  ${USER_ORGANIZATION_FRAGMENT}
  ${ORGANIZATION_FRAGMENT}
`;

export const UPDATE_ORGANIZATION_MEMBER_ROLE_MUTATION = gql`
  mutation UpdateOrganizationMemberRole(
    $id: ID!
    $memberId: String!
    $role: OrganizationMemberRole!
  ) {
    updateOrganizationMemberRole(id: $id, memberId: $memberId, role: $role) {
      ...UserOrganizationFragment
      organization {
        ...OrganizationFragment
      }
    }
  }

  ${USER_ORGANIZATION_FRAGMENT}
  ${ORGANIZATION_FRAGMENT}
`;

export const TOGGLE_ORGANIZATION_MEMBER_SEAT_MUTATION = gql`
  mutation ToggleOrganizationMemberSeat($id: ID!, $memberId: String!) {
    toggleOrganizationMemberSeat(id: $id, memberId: $memberId) {
      ...UserOrganizationFragment
      organization {
        ...OrganizationFragment
      }
    }
  }

  ${USER_ORGANIZATION_FRAGMENT}
  ${ORGANIZATION_FRAGMENT}
`;
