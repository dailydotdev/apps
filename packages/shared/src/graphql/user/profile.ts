import { gql } from 'graphql-request';
import type { Connection } from '../common';
import { gqlClient } from '../common';
import type { TLocation } from '../autocomplete';
import type { Company } from '../../lib/userCompany';

const USER_EXPERIENCE_FRAGMENT = gql`
  fragment UserExperienceFragment on UserExperience {
    id
    type
    title
    description
    createdAt
    startedAt
    endedAt
    customCompanyName
    company {
      id
      name
      image
    }
  }
`;

const getExperiencesProps = (props: string) => `
  edges {
    node {
      ...UserExperienceFragment
      ${props}
    }
  }
  pageInfo {
    hasNextPage
    endCursor
  }
`;

const workProps = `
  employmentType
  locationType
  location {
    id
    city
    subdivision
    country
  }
  skills {
    value
  }
`;

const USER_PROFILE_EXPERIENCES_QUERY = gql`
  query UserExperiences($userId: ID!) {
    work: userExperiences(userId: $userId, type: work, first: 3) {
      ${getExperiencesProps(workProps)}
    }
    education: userExperiences(userId: $userId, type: education, first: 3) {
      ${getExperiencesProps(`subtitle`)}
    }
    project: userExperiences(userId: $userId, type: project, first: 3) {
      ${getExperiencesProps(`url`)}
    }
    certification: userExperiences(userId: $userId, type: certification, first: 3) {
      ${getExperiencesProps(`
        externalReferenceId
        url  
      `)}
    }
  }
  ${USER_EXPERIENCE_FRAGMENT}
`;

export enum UserExperienceType {
  Work = 'work',
  Education = 'education',
  Project = 'project',
  Certification = 'certification',
}

export interface UserExperience {
  id: string;
  type: UserExperienceType;
  title: string;
  description: string | null;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  company: Company | null;
  customCompanyName: string | null;
  subtitle?: string | null;
}

interface UserSkill {
  value: string;
}

export interface UserExperienceWork extends UserExperience {
  type: UserExperienceType.Work;
  employmentType: number | null;
  locationType: number | null;
  location: TLocation | null;
  skills: UserSkill[];
  verified: boolean | null;
}

export interface UserExperienceEducation extends UserExperience {
  type: UserExperienceType.Education;
  subtitle: string | null;
}

export interface UserExperienceProject extends UserExperience {
  type: UserExperienceType.Project;
  url: string | null;
}

export interface UserExperienceCertification extends UserExperience {
  type: UserExperienceType.Certification;
  externalReferenceId: string | null;
  url: string | null;
}

export interface UserProfileExperienceData {
  work: Connection<UserExperienceWork>;
  education: Connection<UserExperienceEducation>;
  project: Connection<UserExperienceProject>;
  certification: Connection<UserExperienceCertification>;
}

export const getUserProfileExperiences = async (
  userId: string,
): Promise<UserProfileExperienceData> => {
  const result = await gqlClient.request<UserProfileExperienceData>(
    USER_PROFILE_EXPERIENCES_QUERY,
    { userId },
  );

  return result;
};
