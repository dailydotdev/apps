import { gql } from 'graphql-request';
import { ORGANIZATION_SHORT_FRAGMENT } from '../organizations/graphql';

export const OPPORTUNITY_CONTENT_FRAGMENT = gql`
  fragment OpportunityContentFragment on OpportunityContentBlock {
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
        keyword
      }
      recruiters {
        id
        name
        username
        bio
        readme
        image
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

export const GET_CANDIDATE_PREFERENCES_QUERY = gql`
  query GetCandidatePreferences {
    getCandidatePreferences {
      status
      cv {
        blob
        contentType
        lastModified
      }
      role
      roleType
      salaryExpectation {
        min
        period
      }
      location {
        city
        country
        subdivision
        continent
      }
      locationType
      employmentType
      companySize
      companyStage
    }
  }
`;

export const UPDATE_CANDIDATE_PREFERENCES_MUTATION = gql`
  mutation UpdateCandidatePreferences(
    $status: ProtoEnumValue
    $role: String
    $roleType: Float
    $employmentType: [ProtoEnumValue]
    $salaryExpectationMin: Float
    $salaryExpectationPeriod: ProtoEnumValue
    $locationCity: String
    $locationCountry: String
    $locationType: [ProtoEnumValue]
  ) {
    updateCandidatePreferences(
      status: $status
      role: $role
      roleType: $roleType
      employmentType: $employmentType
      salaryExpectation: {
        min: $salaryExpectationMin
        period: $salaryExpectationPeriod
      }
      location: [{ city: $locationCity, country: $locationCountry }]
      locationType: $locationType
    ) {
      _
    }
  }
`;
