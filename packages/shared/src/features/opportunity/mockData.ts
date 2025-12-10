import type { Opportunity } from './types';
import type { OpportunityPreviewContextType } from './context/OpportunityPreviewContext';
import { SeniorityLevel } from './protobuf/opportunity';

export const mockOpportunity: Opportunity = {
  id: '89f3daff-d6bb-4652-8f9c-b9f7254c9af1',
  type: 0,
  state: 0,
  title: 'Senior Frontend Developer',
  tldr: 'Join our team to build the next generation of developer tools',
  organization: {
    id: 'org-1',
    name: 'Daily.dev',
    handle: 'dailydotdev',
    permalink: 'https://daily.dev',
    image: 'https://daily.dev/favicon.ico',
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
  location: [
    {
      type: 0,
      city: 'San Francisco',
      country: 'United States',
      subdivision: 'California',
      continent: 'North America',
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

export const mockAnonymousUserTableData: OpportunityPreviewContextType = {
  edges: [
    {
      node: {
        id: '1',
        profileImage:
          'https://media.daily.dev/image/upload/f_auto/v1/placeholders/1',
        anonId: 'anon #1001',
        description:
          'Senior frontend developer with 8+ years experience in React, TypeScript, and modern web technologies. Passionate about building scalable applications.',
        openToWork: true,
        seniority: 'Senior',
        location: 'San Francisco, CA',
        company: {
          name: 'Google',
          favicon: 'https://www.google.com/s2/favicons?domain=google.com',
        },
        lastActivity: new Date(Date.now() - 1000 * 60 * 5),
        topTags: ['react', 'typescript', 'javascript', 'nextjs'],
        recentlyRead: [
          { keyword: { value: 'React' }, issuedAt: new Date('2024-11-01') },
          {
            keyword: { value: 'TypeScript' },
            issuedAt: new Date('2024-10-01'),
          },
        ],
        activeSquads: [
          {
            handle: 'webdev',
            image:
              'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/d81fd85ddaea4d25a658694de448118f',
          },
          {
            handle: 'javascript',
            image:
              'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/d81fd85ddaea4d25a658694de448118f',
          },
        ],
      },
    },
    {
      node: {
        id: '2',
        profileImage:
          'https://media.daily.dev/image/upload/f_auto/v1/placeholders/2',
        anonId: 'anon #1002',
        description:
          'Full-stack engineer specializing in Node.js and React. Love working on challenging problems and learning new technologies.',
        openToWork: true,
        seniority: 'Mid',
        location: 'New York, NY',
        company: {
          name: 'Microsoft',
          favicon: 'https://www.google.com/s2/favicons?domain=microsoft.com',
        },
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
        topTags: ['nodejs', 'react', 'mongodb', 'aws'],
        recentlyRead: [
          { keyword: { value: 'Node.js' }, issuedAt: new Date('2024-11-15') },
          { keyword: { value: 'AWS' }, issuedAt: new Date('2024-09-01') },
        ],
        activeSquads: [
          {
            handle: 'backend',
            image:
              'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/d81fd85ddaea4d25a658694de448118f',
          },
        ],
      },
    },
    {
      node: {
        id: '3',
        profileImage:
          'https://media.daily.dev/image/upload/f_auto/v1/placeholders/3',
        anonId: 'anon #1003',
        description:
          'Frontend developer with expertise in Vue and React. Strong focus on UI/UX and accessibility.',
        openToWork: false,
        seniority: 'Senior',
        location: 'Austin, TX',
        company: {
          name: 'Apple Inc.',
          favicon: 'https://www.google.com/s2/favicons?domain=apple.com',
        },
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24),
        topTags: ['vue', 'react', 'css', 'accessibility'],
        recentlyRead: [
          { keyword: { value: 'Vue' }, issuedAt: new Date('2024-10-15') },
        ],
        activeSquads: [
          {
            handle: 'frontend',
            image:
              'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/d81fd85ddaea4d25a658694de448118f',
          },
          {
            handle: 'css',
            image:
              'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/d81fd85ddaea4d25a658694de448118f',
          },
        ],
      },
    },
  ],
  pageInfo: {
    hasNextPage: false,
    endCursor: null,
  },
  result: {
    tags: ['google', 'startup'],
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
        handle: 'publicsquad',
        image:
          'https://media.daily.dev/image/upload/s--iK6zGJCz--/f_auto,t_logo/v1698841319/logos/collections.jpg',
      },
    ],
    totalCount: 5001,
    opportunityId: '89f3daff-d6bb-4652-8f9c-b9f7254c9af1',
  },
  opportunity: mockOpportunity,
};
