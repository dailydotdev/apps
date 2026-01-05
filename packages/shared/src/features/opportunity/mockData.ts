import type { Opportunity } from './types';
import { OpportunityPreviewStatus } from './types';
import type { OpportunityPreviewContextType } from './context/OpportunityPreviewContext';
import { SeniorityLevel } from './protobuf/opportunity';
import { SourceMemberRole, SourceType } from '../../graphql/sources';

export const mockOpportunity: Opportunity = {
  id: '89f3daff-d6bb-4652-8f9c-b9f7254c9af1',
  type: 0,
  state: 0,
  title: 'Senior Frontend Developer',
  tldr: 'Join our team to build the next generation of developer tools',
  organization: {
    id: 'org-1',
    name: 'Daily.dev',
    website: 'https://daily.dev',
    image: 'https://daily.dev/favicon.ico',
    recruiterTotalSeats: 1,
  },
  content: {
    overview: {
      content:
        'We are looking for a Senior Frontend Developer to join our team and help us build the next generation of developer tools.\n\n## Requirements\n\n- 5+ years of experience with React and TypeScript\n- Strong understanding of modern web technologies\n- Experience with Next.js and server-side rendering\n- Excellent communication skills\n\n## Nice to have\n\n- Experience with Tailwind CSS\n- Knowledge of GraphQL\n- Contributions to open source projects',
      html: '<p>We are looking for a Senior Frontend Developer to join our team and help us build the next generation of developer tools.</p>',
    },
  },
  meta: {
    employmentType: 0,
    teamSize: 10,
    salary: {
      min: 120000,
      max: 180000,
      currency: 'USD',
      period: 0,
    },
    seniorityLevel: SeniorityLevel.SENIOR,
    roleType: 0,
    equity: true,
  },
  recruiters: [
    {
      id: 'recruiter-1',
      name: 'John Doe',
      username: 'johndoe',
      image: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/1',
      bio: 'Talent acquisition specialist',
      title: 'Senior Recruiter',
    },
  ],
  locations: [
    {
      type: 0,
      location: {
        city: 'San Francisco',
        country: 'United States',
        subdivision: 'California',
        continent: 'North America',
      },
    },
  ],
  keywords: [
    { keyword: 'React' },
    { keyword: 'TypeScript' },
    { keyword: 'Next.js' },
    { keyword: 'JavaScript' },
    { keyword: 'Tailwind CSS' },
  ],
};

export const mockOpportunityPreviewData: OpportunityPreviewContextType = {
  result: {
    tags: ['react', 'typescript', 'nextjs', 'javascript', 'nodejs', 'graphql'],
    companies: [
      {
        name: 'Shopify',
        favicon: 'https://www.shopify.com/',
      },
      {
        name: 'Ericsson',
        favicon: 'https://www.ericsson.com/',
      },
      {
        name: 'AMD',
        favicon: 'https://www.amd.com/',
      },
      {
        name: 'Capital One',
        favicon: 'https://www.capitalone.com/',
      },
      {
        name: 'Spotify',
        favicon: 'https://www.spotify.com/',
      },
      {
        name: 'Wipro',
        favicon: 'https://www.wipro.com/',
      },
    ],
    squads: [
      {
        id: 'squad-1',
        handle: 'webdev',
        name: 'Web Development',
        image:
          'https://media.daily.dev/image/upload/s--iK6zGJCz--/f_auto,t_logo/v1698841319/logos/collections.jpg',
        active: false,
        permalink: '',
        public: false,
        type: SourceType.Squad,
        membersCount: 0,
        description: '',
        memberPostingRole: SourceMemberRole.Member,
        memberInviteRole: SourceMemberRole.Member,
        moderationRequired: false,
        moderationPostCount: 0,
      },
      {
        id: 'squad-2',
        handle: 'javascript',
        name: 'JavaScript',
        image:
          'https://media.daily.dev/image/upload/s--iK6zGJCz--/f_auto,t_logo/v1698841319/logos/collections.jpg',
        active: false,
        permalink: '',
        public: false,
        type: SourceType.Squad,
        membersCount: 0,
        description: '',
        memberPostingRole: SourceMemberRole.Member,
        memberInviteRole: SourceMemberRole.Member,
        moderationRequired: false,
        moderationPostCount: 0,
      },
      {
        id: 'squad-3',
        handle: 'react',
        name: 'React Developers',
        image:
          'https://media.daily.dev/image/upload/s--iK6zGJCz--/f_auto,t_logo/v1698841319/logos/collections.jpg',
        active: false,
        permalink: '',
        public: false,
        type: SourceType.Squad,
        membersCount: 0,
        description: '',
        memberPostingRole: SourceMemberRole.Member,
        memberInviteRole: SourceMemberRole.Member,
        moderationRequired: false,
        moderationPostCount: 0,
      },
      {
        id: 'squad-4',
        handle: 'typescript',
        name: 'TypeScript Community',
        image:
          'https://media.daily.dev/image/upload/s--iK6zGJCz--/f_auto,t_logo/v1698841319/logos/collections.jpg',
        active: false,
        permalink: '',
        public: false,
        type: SourceType.Squad,
        membersCount: 0,
        description: '',
        memberPostingRole: SourceMemberRole.Member,
        memberInviteRole: SourceMemberRole.Member,
        moderationRequired: false,
        moderationPostCount: 0,
      },
    ],
    totalCount: 5001,
    opportunityId: '89f3daff-d6bb-4652-8f9c-b9f7254c9af1',
    status: OpportunityPreviewStatus.READY,
  },
  opportunity: mockOpportunity,
};
