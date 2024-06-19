import { GraphQLResult } from '../helpers/graphql';
import { Edge } from '../../src/graphql/common';
import {
  SourceMember,
  SourceMemberRole,
  SourcePermissions,
  SourceType,
} from '../../src/graphql/sources';
import { Squad, SquadData, SquadEdgesData } from '../../src/graphql/squads';
import { cloudinary } from '../../src/lib/image';

export const defaultSquadToken = 'ki3YLcxvSZ2Q6KgMBZvMbly1gnrZ6JnIrhTpUML-Hua';

export const generateTestAdmin = (
  members: Edge<SourceMember>[] = [],
): SourceMember => ({
  user: {
    id: 'Se4LmwLU0q6aVDpX1MkqX',
    name: 'Lee Hansel Solevilla',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
    permalink: 'http://webapp.local.com:5002/abc123zzzz',
    username: 'abc123zzzz',
  },
  source: {
    id: '559581c2-ee2d-440c-b27f-358b074bb0d4',
    active: true,
    handle: 'test',
    name: 'Test',
    permalink: 'http://webapp.local.com:5002/squads/test',
    public: true,
    type: SourceType.Squad,
    image: cloudinary.squads.imageFallback,
    membersCount: 4,
    members: {
      edges: [
        {
          node: {
            user: {
              id: 'Se4LmwLU0q6aVDpX1MkqX',
              name: 'Lee Hansel Solevilla',
              image:
                'https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
              permalink: 'http://webapp.local.com:5002/a123124124111',
              username: 'a123124124111',
            },
            source: null,
            referralToken: defaultSquadToken,
            role: SourceMemberRole.Admin,
          },
        },
        ...members,
      ],
    },
    currentMember: {
      role: SourceMemberRole.Admin,
      referralToken: '3ZvloDmEbgiCKLF_eDg72JKLRPgp6MOpGDkh6qTRFr8',
      user: {
        id: 'Se4LmwLU0q6aVDpX1MkqX',
        name: 'Lee Hansel Solevilla',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
        permalink: 'http://webapp.local.com:5002/a123124124111',
        username: 'a123124124111',
      },
      source: {
        id: '559581c2-ee2d-440c-b27f-358b074bb0d4',
      } as Squad,
      permissions: Object.values(SourcePermissions),
    },
  },
  referralToken: defaultSquadToken,
  role: SourceMemberRole.Admin,
});

export const generateMembersResult = (
  members: Edge<SourceMember>[] = [
    {
      node: {
        role: SourceMemberRole.Admin,
        user: {
          id: 'F8G694HAObSoebZRzeKKa',
          name: 'Eliz Kılıç',
          image:
            'https://daily-now-res.cloudinary.com/image/upload/v1672320685/avatars/avatar_F8G694HAObSoebZRzeKKa.jpg',
          permalink: 'https://app.daily.dev/elizdev',
          username: 'elizdev',
          bio: null,
        },
      },
    },
    {
      node: {
        role: SourceMemberRole.Member,
        user: {
          id: 'LJSkpBexOSCWc8INyu3Eu',
          name: 'Ante Barić',
          image:
            'https://lh3.googleusercontent.com/a/AEdFTp54JgZtTJ9UHLkv8W2uSzfzRWzH95XrJ_1n8N5t=s96-c',
          permalink: 'https://app.daily.dev/capJavert',
          username: 'capJavert',
          bio: null,
        },
      },
    },
    {
      node: {
        role: SourceMemberRole.Member,
        user: {
          id: 'QgTYreBqt',
          name: 'Francesco Ciulla',
          image:
            'https://res.cloudinary.com/daily-now/image/upload/f_auto/v1635325588/avatars/QgTYreBqt',
          permalink: 'https://app.daily.dev/Francesco',
          username: 'Francesco',
          bio: 'I am a Computer Scientist interested in Web3 and DevRel. I create videos and love doing livestreams',
        },
      },
    },
    {
      node: {
        role: SourceMemberRole.Member,
        user: {
          id: 'twmsvOCVr4s9JjlwIKGqI',
          name: 'Vas N',
          image:
            'https://lh3.googleusercontent.com/a-/AOh14GhZpI6rlti8BFP-fzWGDxrFlAmSfb72Vd6u7XS5=s100',
          permalink: 'https://app.daily.dev/vasn',
          username: 'vasn',
          bio: null,
        },
      },
    },
    {
      node: {
        role: SourceMemberRole.Member,
        user: {
          id: 'vqsMiP21barzohGfVjLFx',
          name: 'Hanzel',
          image:
            'https://lh3.googleusercontent.com/a/AEdFTp53MKS-pbc1yrQZViMysf8UJKlG1ou1WKsnU2to=s96-c',
          permalink: 'https://app.daily.dev/lee1995',
          username: 'lee1995',
          bio: null,
        },
      },
    },
  ],
): SquadEdgesData => ({
  sourceMembers: {
    pageInfo: { endCursor: 'dGltZToxNjc1MjYyMTM0NTY4', hasNextPage: true },
    edges: members,
  },
});

export const generateTestMember = (
  i: string | number,
  token = defaultSquadToken,
): SourceMember => ({
  user: {
    id: `Se4LmwLU0q6aVDpX1MkqX${i}`,
    name: `Lee Hansel Solevilla - ${i}`,
    image: `https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile${i}`,
    permalink: `http://webapp.local.com:5002/abc123zzzz${i}`,
    username: `abc123zzzz${i}`,
  },
  source: null,
  referralToken: `${token}${i}`,
  role: SourceMemberRole.Member,
});

export const generateTestSquad = (props: Partial<Squad> = {}): Squad => {
  const squad = {
    id: '343f82f0-85f0-4f10-a666-aa331d8d7a1b',
    active: true,
    handle: 'webteam',
    name: 'Web team',
    permalink: 'https://app.daily.dev/squads/webteam',
    public: true,
    type: SourceType.Squad,
    description: 'A squad for the web team 🥳',
    image:
      'https://daily-now-res.cloudinary.com/image/upload/v1675848308/squads/343f82f0-85f0-4f10-a666-aa331d8d7a1b.png',
    membersCount: 12,
    currentMember: {
      role: SourceMemberRole.Member,
      referralToken: '3ZvloDmEbgiCKLF_eDg72JKLRPgp6MOpGDkh6qTRFr8',
      user: {
        id: 'u1',
      },
      permissions: ['post'],
    },
    ...props,
  };

  if (squad.currentMember) {
    if (squad.public) {
      squad.referralUrl = `https://app.daily.dev/squads/${squad.handle}?cid=squad&userid=${squad.currentMember.user?.id}`;
    } else {
      squad.referralUrl = `https://app.daily.dev/squads/${squad.handle}/${squad.currentMember.referralToken}`;
    }
  }

  return squad;
};

export const generateForbiddenSquadResult = (): GraphQLResult<SquadData> => ({
  data: { source: null },
  errors: [
    {
      message: 'Access denied!',
      locations: [{ line: 3, column: 5 }],
      path: ['source'],
      extensions: { code: 'FORBIDDEN' },
    },
  ],
});

export const generateNotFoundSquadResult = (): GraphQLResult<SquadData> => ({
  data: { source: null },
  errors: [
    {
      message: 'Entity not found',
      locations: [{ line: 3, column: 5 }],
      path: ['source'],
      extensions: { code: 'NOT_FOUND' },
    },
  ],
});

export const generateMembersList = (
  members: Edge<SourceMember>[] = [],
): Edge<SourceMember>[] => [
  {
    node: {
      role: SourceMemberRole.Admin,
      user: {
        id: 'F8G694HAObSoebZRzeKKa',
        name: 'Eliz Kılıç',
        image:
          'https://daily-now-res.cloudinary.com/image/upload/v1672320685/avatars/avatar_F8G694HAObSoebZRzeKKa.jpg',
        permalink: 'https://app.daily.dev/elizdev',
        username: 'elizdev',
        bio: null,
      },
    },
  },
  {
    node: {
      role: SourceMemberRole.Member,
      user: {
        id: 'LJSkpBexOSCWc8INyu3Eu',
        name: 'Ante Barić',
        image:
          'https://lh3.googleusercontent.com/a/AEdFTp54JgZtTJ9UHLkv8W2uSzfzRWzH95XrJ_1n8N5t=s96-c',
        permalink: 'https://app.daily.dev/capJavert',
        username: 'capJavert',
        bio: null,
      },
    },
  },
  {
    node: {
      role: SourceMemberRole.Member,
      user: {
        id: 'QgTYreBqt',
        name: 'Francesco Ciulla',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto/v1635325588/avatars/QgTYreBqt',
        permalink: 'https://app.daily.dev/Francesco',
        username: 'Francesco',
        bio: 'I am a Computer Scientist interested in Web3 and DevRel. I create videos and love doing livestreams',
      },
    },
  },
  {
    node: {
      role: SourceMemberRole.Member,
      user: {
        id: 'twmsvOCVr4s9JjlwIKGqI',
        name: 'Vas N',
        image:
          'https://lh3.googleusercontent.com/a-/AOh14GhZpI6rlti8BFP-fzWGDxrFlAmSfb72Vd6u7XS5=s100',
        permalink: 'https://app.daily.dev/vasn',
        username: 'vasn',
        bio: null,
      },
    },
  },
  {
    node: {
      role: SourceMemberRole.Member,
      user: {
        id: 'vqsMiP21barzohGfVjLFx',
        name: 'Hanzel',
        image:
          'https://lh3.googleusercontent.com/a/AEdFTp53MKS-pbc1yrQZViMysf8UJKlG1ou1WKsnU2to=s96-c',
        permalink: 'https://app.daily.dev/lee1995',
        username: 'lee1995',
        bio: null,
      },
    },
  },
  {
    node: {
      role: SourceMemberRole.Member,
      user: {
        id: 'EEO0c1ol7u5IpOuykRZ1K',
        name: 'Sab',
        image:
          'https://lh3.googleusercontent.com/a/ALm5wu0D1wq8TGfk6a7LmNRBS5WtAjqtLLM7UsSqI9p3=s96-c',
        permalink: 'https://app.daily.dev/Sab007',
        username: 'Sab007',
        bio: 'Building products @ daily.dev',
      },
    },
  },
  {
    node: {
      role: SourceMemberRole.Member,
      user: {
        id: 'yRuVFf6IbfTylBjx9Dzvt',
        name: 'Denis Bolkovskis',
        image:
          'https://lh3.googleusercontent.com/a-/AFdZucocewwzTITzuSkqUgYdyMRmgem3kPejvX0IAEaLdA=s100',
        permalink: 'https://app.daily.dev/denisb0',
        username: 'denisb0',
        bio: null,
      },
    },
  },
  {
    node: {
      role: SourceMemberRole.Member,
      user: {
        id: 'IfGXaLUgpCHFaqiGEQQtp',
        name: 'Sabarinath Selvam',
        image:
          'https://lh3.googleusercontent.com/a/AItbvmn49xqrT1jztKLT6oJjrtFiVf4yDTfmaPnTQOke=s100',
        permalink: 'https://app.daily.dev/wanderer_007',
        username: 'wanderer_007',
        bio: null,
      },
    },
  },
  {
    node: {
      role: SourceMemberRole.Member,
      user: {
        id: 'k7eIkWOKPsTKc2SLpUB6v',
        name: 'Deniz Gunsav',
        image:
          'https://daily-now-res.cloudinary.com/image/upload/v1668677845/avatars/avatar_k7eIkWOKPsTKc2SLpUB6v.jpg',
        permalink: 'https://app.daily.dev/denizgunsav',
        username: 'denizgunsav',
        bio: 'Visual Brand Designer @ daily.dev',
      },
    },
  },
  {
    node: {
      role: SourceMemberRole.Member,
      user: {
        id: 'ab02e61b958d49d88c8420b431a4d91c',
        name: 'Lee Hansel Solevilla Jr',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto/v1664618465/avatars/ab02e61b958d49d88c8420b431a4d91c',
        permalink: 'https://app.daily.dev/sshanzel',
        username: 'sshanzel',
        bio: 'Software Engineer @daily.dev 👨‍💻  yes! here! 🥳',
      },
    },
  },
  {
    node: {
      role: SourceMemberRole.Member,
      user: {
        id: '5e0af68445e04c02b0656c3530664aff',
        name: 'Tsahi Matsliah',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto/v1601385665/avatars/5e0af68445e04c02b0656c3530664aff',
        permalink: 'https://app.daily.dev/tsahimatsliah2',
        username: 'tsahimatsliah2',
        bio: 'Co-Founder, CDO at daily.dev, Designing this platform',
      },
    },
  },
  {
    node: {
      role: SourceMemberRole.Member,
      user: {
        id: '28849d86070e4c099c877ab6837c61f0',
        name: 'Ido Shamun',
        image:
          'https://daily-now-res.cloudinary.com/image/upload/v1669537199/avatars/avatar_28849d86070e4c099c877ab6837c61f0.jpg',
        permalink: 'https://app.daily.dev/idoshamun',
        username: 'idoshamun',
        bio: 'Building this platform 👨‍💻',
      },
    },
  },
  {
    node: {
      role: SourceMemberRole.Member,
      user: {
        id: 'JUNiIGCV-',
        name: 'Chris Bongers',
        image:
          'https://daily-now-res.cloudinary.com/image/upload/v1669539142/avatars/avatar_JUNiIGCV-.jpg',
        permalink: 'https://app.daily.dev/DailyDevTips',
        username: 'DailyDevTips',
        bio: 'Daily blogger and web team lead at daily.dev 💖',
      },
    },
  },
  ...members,
];
