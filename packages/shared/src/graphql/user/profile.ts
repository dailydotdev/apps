import { gql } from 'graphql-request';
import type { Connection } from '../common';
import { gqlClient } from '../common';
import type { TLocation } from '../autocomplete';
import type { Company } from '../../lib/userCompany';
import { excludeProperties } from '../../lib/utils';

type UserGeneralExperience = UserExperience & {
  skills?: UserSkill[];
  location?: TLocation;
};

const excludedProperties = [
  'startedAtYear',
  'startedAtMonth',
  'endedAtYear',
  'endedAtMonth',
  'company',
  'current',
  'createdAt',
  'id',
  'location',
];

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
    employmentType
    locationType
    url
    location {
      id
      city
      subdivision
      country
    }
    skills {
      value
    }
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

const USER_EXPERIENCE_BY_ID_QUERY = gql`
  query UserExperienceById($id: ID!) {
    userExperienceById(id: $id) {
      ...UserExperienceFragment
    }
  }
  ${USER_EXPERIENCE_FRAGMENT}
`;

export const getUserExperienceById = async (
  id: string,
): Promise<UserGeneralExperience | null> => {
  const result = await gqlClient.request(USER_EXPERIENCE_BY_ID_QUERY, { id });
  return result.userExperienceById;
};

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
  description?: string | null;
  createdAt: string;
  startedAt?: string | null;
  endedAt?: string | null;
  company?: Company | null;
  customCompanyName?: string | null;
  subtitle?: string | null;
  url?: string | null;
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

const UPSERT_USER_GENERAL_EXPERIENCE = gql`
  mutation UpsertUserGeneralExperience(
    $input: UserGeneralExperienceInput!
    $id: ID
  ) {
    upsertUserGeneralExperience(input: $input, id: $id) {
      id
      type
      title
      subtitle
      description
      startedAt
      endedAt
      company {
        id
        name
      }
      customCompanyName
      url
      grade
      externalReferenceId
      createdAt
    }
  }
`;

export const upsertUserGeneralExperience = async (
  input: UserExperience,
  id?: string,
) => {
  const cleanedInput = excludeProperties(input, [
    ...excludedProperties,
    'skills',
  ]);
  const result = await gqlClient.request(UPSERT_USER_GENERAL_EXPERIENCE, {
    input: cleanedInput,
    id,
  });
  return result;
};

const UPSERT_USER_WORK_EXPERIENCE = gql`
  mutation UpsertUserWorkExperience($input: UserExperienceWorkInput!, $id: ID) {
    upsertUserWorkExperience(input: $input, id: $id) {
      id
      type
      title
      subtitle
      description
      startedAt
      endedAt
      company {
        id
        name
      }
      customCompanyName
      employmentType
      location {
        id
        city
        subdivision
        country
      }
      locationType
      skills {
        value
      }
      createdAt
    }
  }
`;

export const upsertUserWorkExperience = async (
  input: UserExperienceWork,
  id?: string,
) => {
  const cleanedInput = excludeProperties(input, excludedProperties);

  const result = await gqlClient.request(UPSERT_USER_WORK_EXPERIENCE, {
    input: cleanedInput,
    id,
  });
  return result;
};
