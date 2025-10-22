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
  // to remove start - for dev only
  subtitle?: string | null;
  url?: string | null;
  externalReferenceId?: string | null;
  verified: boolean | null;
  skills: UserSkill[];
  // to remove end - for dev only
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

  const dummyData = {
    work: {
      edges: [
        {
          node: {
            id: '1',
            type: UserExperienceType.Work,
            title: 'Software Engineer',
            description:
              'Leading frontend architecture and developer experience initiatives for the Next.js ecosystem. Reduced build times by 40% through optimization strategies show more',
            createdAt: new Date().toISOString(),
            startedAt: new Date('2020-01-01').toISOString(),
            endedAt: new Date('2021-01-01').toISOString(),
            customCompanyName: 'Tech Corp',
            company: {
              id: 'comp1',
              name: 'Tech Corp',
              image: null,
            },
            employmentType: 1,
            locationType: 1,
            location: {
              id: 'loc1',
              city: 'San Francisco',
              subdivision: 'CA',
              country: 'USA',
            },
            skills: [{ value: 'JavaScript' }, { value: 'React' }],
          } as UserExperienceWork,
        },
        {
          node: {
            id: '2',
            type: UserExperienceType.Work,
            title: 'Software Engineer',
            description:
              'Leading frontend architecture and developer experience initiatives for the Next.js ecosystem. Reduced build times by 40% through optimization strategies show more',
            createdAt: new Date().toISOString(),
            startedAt: new Date('2020-01-01').toISOString(),
            endedAt: new Date('2021-01-01').toISOString(),
            customCompanyName: 'Tech Corp',
            company: {
              id: 'comp1',
              name: 'Tech Corp',
              image: null,
            },
            employmentType: 1,
            locationType: 1,
            location: {
              id: 'loc1',
              city: 'San Francisco',
              subdivision: 'CA',
              country: 'USA',
            },
            skills: [{ value: 'JavaScript' }, { value: 'React' }],
          } as UserExperienceWork,
        },
      ],
      pageInfo: { hasNextPage: false, endCursor: null },
    },
    education: {
      edges: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    },
    project: {
      edges: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    },
    certification: {
      edges: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    },
  };

  return dummyData;
};
