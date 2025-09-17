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
        image
        title
        bio
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
      questions {
        id
        title
        placeholder
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
      }
      locationType
      employmentType
      companySize
      companyStage
      customKeywords
      keywords {
        keyword
      }
    }
  }
`;

export const UPDATE_CANDIDATE_PREFERENCES_MUTATION = gql`
  mutation UpdateCandidatePreferences(
    $status: ProtoEnumValue
    $role: String
    $roleType: Float
    $employmentType: [ProtoEnumValue]
    $salaryExpectation: SalaryExpectationInput
    $location: [LocationInput]
    $locationType: [ProtoEnumValue]
    $customKeywords: Boolean
  ) {
    updateCandidatePreferences(
      status: $status
      role: $role
      roleType: $roleType
      employmentType: $employmentType
      salaryExpectation: $salaryExpectation
      location: $location
      locationType: $locationType
      customKeywords: $customKeywords
    ) {
      _
    }
  }
`;

export const SAVE_OPPORTUNITY_SCREENING_ANSWERS = gql`
  mutation SaveOpportunityScreeningAnswers(
    $id: ID!
    $answers: [OpportunityScreeningAnswerInput!]!
  ) {
    saveOpportunityScreeningAnswers(id: $id, answers: $answers) {
      _
    }
  }
`;

export const ACCEPT_OPPORTUNITY_MATCH = gql`
  mutation AcceptOpportunityMatch($id: ID!) {
    acceptOpportunityMatch(id: $id) {
      _
    }
  }
`;

export const CLEAR_RESUME_MUTATION = gql`
  mutation ClearResume {
    clearResume {
      _
    }
  }
`;

export const AUTOCOMPLETE_KEYWORDS_QUERY = gql`
  query AutocompleteKeywords($query: String!, $limit: Int) {
    autocompleteKeywords(query: $query, limit: $limit) {
      keyword
      title
    }
  }
`;

export const CANDIDATE_KEYWORD_ADD_MUTATION = gql`
  mutation CandidateAddKeyword($keyword: String!) {
    candidateAddKeyword(keyword: $keyword) {
      _
    }
  }
`;

export const CANDIDATE_KEYWORD_REMOVE_MUTATION = gql`
  mutation CandidateRemoveKeyword($keyword: String!) {
    candidateRemoveKeyword(keyword: $keyword) {
      _
    }
  }
`;
