import { gql } from 'graphql-request';
import { ORGANIZATION_SHORT_FRAGMENT } from '../organizations/graphql';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { LoggedUser } from '../../lib/user';
import { fetchPricingPreview, PurchaseType } from '../../graphql/paddle';

export const OPPORTUNITY_CONTENT_FRAGMENT = gql`
  fragment OpportunityContentFragment on OpportunityContentBlock {
    html
    content
  }
`;

export const GCS_BLOB_FRAGMENT = gql`
  fragment GCSBlob on GCSBlob {
    blob
    fileName
    contentType
    lastModified
    signedUrl
  }
`;

export const LINK_FRAGMENT = gql`
  fragment Link on OrganizationLink {
    type
    socialType
    title
    link
  }
`;

export const QUESTION_FRAGMENT = gql`
  fragment OpportunityScreeningQuestionFragment on OpportunityScreeningQuestion {
    id
    title
    placeholder
  }
`;

export const FEEDBACK_QUESTION_FRAGMENT = gql`
  fragment OpportunityFeedbackQuestionFragment on OpportunityFeedbackQuestion {
    id
    title
    placeholder
  }
`;

export const OPPORTUNITY_FRAGMENT = gql`
  fragment OpportunityFragment on Opportunity {
    id
    type
    state
    title
    tldr
    organization {
      ...OrganizationShortFragment

      description
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
      equity
    }
    location {
      type
      city
      country
      subdivision
      continent
    }
    questions {
      ...OpportunityScreeningQuestionFragment
    }
    feedbackQuestions {
      ...OpportunityFeedbackQuestionFragment
    }
    subscriptionStatus
  }
  ${ORGANIZATION_SHORT_FRAGMENT}
  ${OPPORTUNITY_CONTENT_FRAGMENT}
  ${LINK_FRAGMENT}
  ${QUESTION_FRAGMENT}
  ${FEEDBACK_QUESTION_FRAGMENT}
`;

export const OPPORTUNITY_BY_ID_QUERY = gql`
  query OpportunityById($id: ID!) {
    opportunityById(id: $id) {
      ...OpportunityFragment
    }
  }
  ${OPPORTUNITY_FRAGMENT}
`;

export const OPPORTUNITY_MATCH_FRAGMENT = gql`
  fragment OpportunityMatchFragment on OpportunityMatch {
    status
    description {
      reasoning
    }
    userId
    opportunityId
    createdAt
    updatedAt
    user {
      id
      name
      username
      image
      bio
      reputation
      linkedin
    }
    candidatePreferences {
      status
      role
      roleType
      cv {
        ...GCSBlob
      }
    }
    screening {
      screening
      answer
    }
    feedback {
      screening
      answer
    }
    engagementProfile {
      profileText
    }
  }
  ${GCS_BLOB_FRAGMENT}
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

export const OPPORTUNITY_MATCHES_QUERY = gql`
  query OpportunityMatches(
    $opportunityId: ID!
    $status: OpportunityMatchStatus
    $after: String
    $first: Int
  ) {
    opportunityMatches(
      opportunityId: $opportunityId
      status: $status
      after: $after
      first: $first
    ) {
      pageInfo {
        hasNextPage
        endCursor
        totalCount
      }
      edges {
        node {
          userId
          opportunityId
          status
          createdAt
          updatedAt
          description {
            reasoning
          }
          screening {
            screening
            answer
          }
          engagementProfile {
            profileText
          }
          user {
            id
            name
            username
            image
            bio
            reputation
            linkedin
          }
          candidatePreferences {
            status
            role
            roleType
            cv {
              ...GCSBlob
            }
          }
          applicationRank {
            score
            description
          }
          previewUser {
            seniority
            location
            company {
              name
              favicon
            }
            openToWork
            topTags
            recentlyRead {
              keyword {
                value
              }
              issuedAt
            }
            activeSquads {
              id
              name
              image
            }
            lastActivity
          }
        }
      }
    }
  }

  ${GCS_BLOB_FRAGMENT}
`;

export const GET_CANDIDATE_PREFERENCES_QUERY = gql`
  query GetCandidatePreferences {
    getCandidatePreferences {
      status
      cv {
        ...GCSBlob
      }
      employmentAgreement {
        ...GCSBlob
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

  ${GCS_BLOB_FRAGMENT}
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

export const SAVE_OPPORTUNITY_FEEDBACK_ANSWERS = gql`
  mutation SaveOpportunityFeedbackAnswers(
    $id: ID!
    $answers: [OpportunityScreeningAnswerInput!]!
  ) {
    saveOpportunityFeedbackAnswers(id: $id, answers: $answers) {
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

export const REJECT_OPPORTUNITY_MATCH = gql`
  mutation RejectOpportunityMatch($id: ID!) {
    rejectOpportunityMatch(id: $id) {
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
  mutation CandidateAddKeywords($keywords: [String!]!) {
    candidateAddKeywords(keywords: $keywords) {
      _
    }
  }
`;

export const CANDIDATE_KEYWORD_REMOVE_MUTATION = gql`
  mutation CandidateRemoveKeywords($keywords: [String!]!) {
    candidateRemoveKeywords(keywords: $keywords) {
      _
    }
  }
`;

export const UPLOAD_EMPLOYMENT_AGREEMENT_MUTATION = gql`
  mutation UploadEmploymentAgreement($file: Upload!) {
    uploadEmploymentAgreement(file: $file) {
      _
    }
  }
`;

export const CLEAR_EMPLOYMENT_AGREEMENT_MUTATION = gql`
  mutation ClearEmploymentAgreement {
    clearEmploymentAgreement {
      _
    }
  }
`;

export const EDIT_OPPORTUNITY_MUTATION = gql`
  mutation EditOpportunity(
    $id: ID!
    $payload: OpportunityEditInput!
    $organizationImage: Upload
  ) {
    editOpportunity(
      id: $id
      payload: $payload
      organizationImage: $organizationImage
    ) {
      ...OpportunityFragment
    }
  }
  ${OPPORTUNITY_FRAGMENT}
`;

export const CLEAR_ORGANIZATION_IMAGE_MUTATION = gql`
  mutation ClearOrganizationImage($id: ID!) {
    clearOrganizationImage(id: $id) {
      _
    }
  }
`;

export const RECOMMEND_OPPORTUNITY_SCREENING_QUESTIONS_MUTATION = gql`
  mutation RecommendOpportunityScreeningQuestions($id: ID!) {
    recommendOpportunityScreeningQuestions(id: $id) {
      ...OpportunityScreeningQuestionFragment
    }
  }
  ${QUESTION_FRAGMENT}
`;

export const UPDATE_OPPORTUNITY_STATE_MUTATION = gql`
  mutation UpdateOpportunityState($id: ID!, $state: ProtoEnumValue!) {
    updateOpportunityState(id: $id, state: $state) {
      _
    }
  }
`;

export const OPPORTUNITIES_QUERY = gql`
  query Opportunities($state: ProtoEnumValue, $after: String, $first: Int) {
    opportunities(state: $state, after: $after, first: $first) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...OpportunityFragment
        }
      }
    }
  }
  ${OPPORTUNITY_FRAGMENT}
`;

export const RECRUITER_ACCEPT_OPPORTUNITY_MATCH_MUTATION = gql`
  mutation RecruiterAcceptOpportunityMatch(
    $opportunityId: ID!
    $candidateUserId: ID!
  ) {
    recruiterAcceptOpportunityMatch(
      opportunityId: $opportunityId
      candidateUserId: $candidateUserId
    ) {
      _
    }
  }
`;

export const RECRUITER_REJECT_OPPORTUNITY_MATCH_MUTATION = gql`
  mutation RecruiterRejectOpportunityMatch(
    $opportunityId: ID!
    $candidateUserId: ID!
  ) {
    recruiterRejectOpportunityMatch(
      opportunityId: $opportunityId
      candidateUserId: $candidateUserId
    ) {
      _
    }
  }
`;

export const USER_OPPORTUNITY_MATCHES_QUERY = gql`
  query UserOpportunityMatches($after: String, $first: Int) {
    userOpportunityMatches(after: $after, first: $first) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...OpportunityMatchFragment
          opportunity {
            ...OpportunityFragment
          }
        }
        cursor
      }
    }
  }
  ${OPPORTUNITY_MATCH_FRAGMENT}
  ${OPPORTUNITY_FRAGMENT}
`;

export const OPPORTUNITY_PREVIEW = gql`
  query OpportunityPreview($opportunityId: ID) {
    opportunityPreview(opportunityId: $opportunityId) {
      edges {
        node {
          id
          profileImage
          anonId
          description
          openToWork
          seniority
          location
          company {
            name
            favicon
          }
          lastActivity
          topTags
          recentlyRead {
            keyword {
              value
            }
            issuedAt
          }
          activeSquads {
            handle
            image
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      result {
        tags
        companies {
          name
          favicon
        }
        squads {
          handle
          image
        }
        totalCount
        opportunityId
      }
    }
  }
`;

export const OPPORTUNITY_STATS_QUERY = gql`
  query OpportunityStats($opportunityId: ID!) {
    opportunityStats(opportunityId: $opportunityId) {
      matched
      reached
      considered
      decided
      forReview
      introduced
    }
  }
`;

export const recruiterPricesQueryOptions = ({
  isLoggedIn,
  user,
}: {
  isLoggedIn: boolean;
  user: LoggedUser;
}) => {
  return {
    queryKey: generateQueryKey(
      RequestKey.PricePreview,
      user,
      PurchaseType.Recruiter,
    ),
    queryFn: async () => {
      return fetchPricingPreview(PurchaseType.Recruiter);
    },
    enabled: isLoggedIn,
    staleTime: StaleTime.Default,
  };
};
