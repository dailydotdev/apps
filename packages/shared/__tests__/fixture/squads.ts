import { Edge } from '../../src/graphql/common';
import { SquadMember, SquadMemberRole } from '../../src/graphql/squads';

export const defaultSquadToken = 'ki3YLcxvSZ2Q6KgMBZvMbly1gnrZ6JnIrhTpUML-Hua';

export const generateTestOwner = (
  members: Edge<SquadMember>[] = [],
): SquadMember => ({
  user: {
    id: 'Se4LmwLU0q6aVDpX1MkqX',
    name: 'Lee Hansel Solevilla',
    image:
      'https://daily-now-res.cloudinary.com/image/upload/f_auto/v1664367305/placeholders/placeholder3',
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
    type: 'squad',
    image:
      'https://daily-now-res.cloudinary.com/image/upload/v1672041320/squads/squad_placeholder.jpg',
    membersCount: 4,
    members: {
      edges: [
        {
          node: {
            user: {
              id: 'Se4LmwLU0q6aVDpX1MkqX',
              name: 'Lee Hansel Solevilla',
              image:
                'https://daily-now-res.cloudinary.com/image/upload/f_auto/v1664367305/placeholders/placeholder3',
              permalink: 'http://webapp.local.com:5002/a123124124111',
              username: 'a123124124111',
            },
            source: null,
            referralToken: defaultSquadToken,
            role: SquadMemberRole.Owner,
          },
        },
        ...members,
      ],
    },
  },
  referralToken: defaultSquadToken,
  role: SquadMemberRole.Owner,
});

export const generateTestMember = (
  i: string | number,
  token = defaultSquadToken,
): SquadMember => ({
  user: {
    id: `Se4LmwLU0q6aVDpX1MkqX${i}`,
    name: `Lee Hansel Solevilla - ${i}`,
    image: `https://daily-now-res.cloudinary.com/image/upload/f_auto/v1664367305/placeholders/placeholder3${i}`,
    permalink: `http://webapp.local.com:5002/abc123zzzz${i}`,
    username: `abc123zzzz${i}`,
  },
  source: null,
  referralToken: `${token}${i}`,
  role: SquadMemberRole.Member,
});
