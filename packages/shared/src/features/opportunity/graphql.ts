import { gql } from 'graphql-request';
import { ORGANIZATION_SHORT_FRAGMENT } from '../organizations/graphql';

export const OPPORTUNITY_CONTENT_FRAGMENT = gql`
  fragment OpportunityContentFragment on OpportunityContentBlock {
    # content
    html
  }
`;

export const OPPORTUNITY_BY_ID_QUERY = gql`
  query OpportunityById($id: ID!) {
    opportunityById(id: $id) {
      id
      type
      title
      tldr
      organization {
        ...OrganizationShortFragment

        size
        stage
        website
        perks
        category
        founded
        location

        customLinks {
          ...Link
        }
        socialLinks {
          ...Link
        }
        pressLinks {
          ...Link
        }
      }
      content {
        overview {
          ...OpportunityContentFragment
        }
        responsibilities {
          ...OpportunityContentFragment
        }
        requirements {
          ...OpportunityContentFragment
        }
        whatYoullDo {
          ...OpportunityContentFragment
        }
        interviewProcess {
          ...OpportunityContentFragment
        }
      }
      keywords {
        value
      }
      recruiters {
        id
        name
        username
        bio
        readme
      }
      meta {
        roleType
        seniorityLevel
        teamSize
        employmentType
        salary {
          min
          max
          period
        }
      }
      location {
        type
        city
        country
        subdivision
        continent
      }
    }
  }

  fragment Link on OrganizationLink {
    type
    socialType
    title
    link
  }

  ${ORGANIZATION_SHORT_FRAGMENT}
  ${OPPORTUNITY_CONTENT_FRAGMENT}
`;

export const GET_OPPORTUNITY_MATCH_QUERY = gql`
  query GetOpportunityMatch($id: ID!) {
    getOpportunityMatch(id: $id) {
      status
      description {
        reasoning
      }
    }
  }
`;
