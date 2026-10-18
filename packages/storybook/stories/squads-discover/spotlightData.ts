// Spotlight's data for the search stories, written by hand: a subset of
// production's action catalog, made-up people with placeholder avatars,
// made-up posts from public publishers, and public tags. No real users.
/* eslint-disable */
import type { SpotlightAction } from '@dailydotdev/shared/src/graphql/spotlight';

type Hit = {
  id: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
};

const placeholders =
  'https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1/placeholders/';

export const spotlightActions = [
  {
    id: 'nav-profile',
    group: 'Navigate',
    title: 'Go to your profile',
    subtitle: null,
    icon: 'UserIcon',
    keywords: ['me', 'account'],
    shortcut: null,
    quickKey: 'me',
    requiresAuth: true,
    requiresPlus: false,
    platforms: null,
    kind: 'Navigate',
    payload: {
      path: '/${username}',
    },
  },
  {
    id: 'nav-for-you',
    group: 'Navigate',
    title: 'Go to For you',
    subtitle: 'Your personalized feed',
    icon: 'HomeIcon',
    keywords: ['home', 'feed', 'main'],
    shortcut: null,
    quickKey: null,
    requiresAuth: false,
    requiresPlus: false,
    platforms: null,
    kind: 'Navigate',
    payload: {
      path: '/',
    },
  },
  {
    id: 'nav-popular',
    group: 'Navigate',
    title: 'Go to Popular',
    subtitle: null,
    icon: 'HotIcon',
    keywords: ['explore', 'trending'],
    shortcut: null,
    quickKey: null,
    requiresAuth: false,
    requiresPlus: false,
    platforms: null,
    kind: 'Navigate',
    payload: {
      path: '/posts',
    },
  },
  {
    id: 'nav-latest',
    group: 'Navigate',
    title: 'Go to Latest',
    subtitle: null,
    icon: 'TimerIcon',
    keywords: ['recent', 'new'],
    shortcut: null,
    quickKey: null,
    requiresAuth: false,
    requiresPlus: false,
    platforms: null,
    kind: 'Navigate',
    payload: {
      path: '/posts/latest',
    },
  },
  {
    id: 'nav-bookmarks',
    group: 'Navigate',
    title: 'Go to Bookmarks',
    subtitle: null,
    icon: 'BookmarkIcon',
    keywords: ['saved'],
    shortcut: null,
    quickKey: 'gb',
    requiresAuth: true,
    requiresPlus: false,
    platforms: null,
    kind: 'Navigate',
    payload: {
      path: '/bookmarks',
    },
  },
  {
    id: 'nav-notifications',
    group: 'Navigate',
    title: 'Go to Notifications',
    subtitle: null,
    icon: 'BellIcon',
    keywords: ['activity', 'inbox'],
    shortcut: null,
    quickKey: null,
    requiresAuth: true,
    requiresPlus: false,
    platforms: null,
    kind: 'Navigate',
    payload: {
      path: '/notifications',
    },
  },
  {
    id: 'nav-squads',
    group: 'Navigate',
    title: 'Go to Squads',
    subtitle: null,
    icon: 'SquadIcon',
    keywords: ['communities'],
    shortcut: null,
    quickKey: null,
    requiresAuth: false,
    requiresPlus: false,
    platforms: null,
    kind: 'Navigate',
    payload: {
      path: '/squads',
    },
  },
  {
    id: 'create-post',
    group: 'Create',
    title: 'New post',
    subtitle: 'Share a link or write a story',
    icon: 'PlusIcon',
    keywords: ['post', 'create', 'share', 'write', 'new'],
    shortcut: 'N P',
    quickKey: null,
    requiresAuth: true,
    requiresPlus: false,
    platforms: null,
    kind: 'Navigate',
    payload: {
      path: '/squads/create',
    },
  },
  {
    id: 'create-squad',
    group: 'Create',
    title: 'New squad',
    subtitle: 'Start your own community',
    icon: 'SquadIcon',
    keywords: ['squad', 'community', 'group'],
    shortcut: null,
    quickKey: null,
    requiresAuth: true,
    requiresPlus: false,
    platforms: null,
    kind: 'OpenModal',
    payload: {
      modal: 'NewSquad',
    },
  },
  {
    id: 'search-posts',
    group: 'Search',
    title: 'Search posts',
    subtitle: null,
    icon: 'SearchIcon',
    keywords: ['posts', 'articles', 'find'],
    shortcut: null,
    quickKey: null,
    requiresAuth: false,
    requiresPlus: false,
    platforms: null,
    kind: 'RunClientAction',
    payload: {
      handlerId: 'searchPosts',
    },
  },
  {
    id: 'search-sources',
    group: 'Search',
    title: 'Search sources',
    subtitle: null,
    icon: 'SourceIcon',
    keywords: ['sources', 'find', 'publisher'],
    shortcut: null,
    quickKey: null,
    requiresAuth: false,
    requiresPlus: false,
    platforms: null,
    kind: 'RunClientAction',
    payload: {
      handlerId: 'searchSources',
    },
  },
  {
    id: 'search-users',
    group: 'Search',
    title: 'Search people',
    subtitle: null,
    icon: 'UserIcon',
    keywords: ['users', 'people', 'profiles', 'find'],
    shortcut: null,
    quickKey: null,
    requiresAuth: false,
    requiresPlus: false,
    platforms: null,
    kind: 'RunClientAction',
    payload: {
      handlerId: 'searchUsers',
    },
  },
  {
    id: 'search-tags',
    group: 'Search',
    title: 'Search tags',
    subtitle: null,
    icon: 'HashtagIcon',
    keywords: ['tags', 'topics', 'find'],
    shortcut: null,
    quickKey: null,
    requiresAuth: false,
    requiresPlus: false,
    platforms: null,
    kind: 'RunClientAction',
    payload: {
      handlerId: 'searchTags',
    },
  },
  {
    id: 'settings-toggle-theme',
    group: 'Settings',
    title: 'Toggle dark mode',
    subtitle: null,
    icon: 'MoonIcon',
    keywords: ['theme', 'dark', 'light', 'mode'],
    shortcut: null,
    quickKey: null,
    requiresAuth: false,
    requiresPlus: false,
    platforms: null,
    kind: 'ToggleSetting',
    payload: {
      key: 'theme',
    },
  },
  {
    id: 'help-feedback',
    group: 'Help',
    title: 'Send feedback',
    subtitle: null,
    icon: 'FeedbackIcon',
    keywords: ['feedback', 'support', 'contact'],
    shortcut: null,
    quickKey: null,
    requiresAuth: false,
    requiresPlus: false,
    platforms: null,
    kind: 'OpenModal',
    payload: {
      modal: 'Feedback',
    },
  },
] as unknown as SpotlightAction[];

export const sampleUsers: Hit[] = [
  {
    id: 'u1',
    title: 'Jane Developer',
    subtitle: 'reactjane',
    image: `${placeholders}1`,
  },
  {
    id: 'u2',
    title: 'Alex Rivera',
    subtitle: 'ai_alex',
    image: `${placeholders}2`,
  },
  {
    id: 'u3',
    title: 'Sam Lee',
    subtitle: 'pydev_sam',
    image: `${placeholders}3`,
  },
  {
    id: 'u4',
    title: 'Priya Shah',
    subtitle: 'rustacean_priya',
    image: `${placeholders}4`,
  },
  {
    id: 'u5',
    title: 'Noah Kim',
    subtitle: 'devops_noah',
    image: `${placeholders}5`,
  },
  {
    id: 'u6',
    title: 'Lena Fischer',
    subtitle: 'typescript_lena',
    image: `${placeholders}6`,
  },
  {
    id: 'u7',
    title: 'Omar Haddad',
    subtitle: 'css_omar',
    image: `${placeholders}7`,
  },
  {
    id: 'u8',
    title: 'Mia Novak',
    subtitle: 'nodemia',
    image: `${placeholders}8`,
  },
];

export const samplePosts: Hit[] = [
  {
    id: 'p1',
    title: 'React Server Components, explained with one small app',
    subtitle: 'freeCodeCamp',
    image:
      'https://daily-now-res.cloudinary.com/image/upload/t_logo,f_auto/v1628412854/logos/freecodecamp',
  },
  {
    id: 'p2',
    title: 'Writing React hooks you can test',
    subtitle: 'Medium',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/medium',
  },
  {
    id: 'p3',
    title: 'Building an AI agent that reviews pull requests',
    subtitle: 'Hacker News',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/hn',
  },
  {
    id: 'p4',
    title: 'A practical guide to running LLMs locally',
    subtitle: 'Medium',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/medium',
  },
  {
    id: 'p5',
    title: 'Python type hints that catch real bugs',
    subtitle: 'freeCodeCamp',
    image:
      'https://daily-now-res.cloudinary.com/image/upload/t_logo,f_auto/v1628412854/logos/freecodecamp',
  },
  {
    id: 'p6',
    title: 'Rust ownership in ten minutes',
    subtitle: 'Hacker News',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/hn',
  },
  {
    id: 'p7',
    title: 'What changed in the latest TypeScript release',
    subtitle: 'The Next Web',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tnw',
  },
  {
    id: 'p8',
    title: 'Kubernetes probes, without the guesswork',
    subtitle: 'Medium',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/medium',
  },
  {
    id: 'p9',
    title: 'Docker images that build in seconds',
    subtitle: 'Hacker News',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/hn',
  },
  {
    id: 'p10',
    title: 'Modern CSS layouts you can use today',
    subtitle: 'freeCodeCamp',
    image:
      'https://daily-now-res.cloudinary.com/image/upload/t_logo,f_auto/v1628412854/logos/freecodecamp',
  },
  {
    id: 'p11',
    title: 'Node.js streams for people who avoid them',
    subtitle: 'Node.js',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/nodejs',
  },
  {
    id: 'p12',
    title: 'Growing from senior to staff engineer',
    subtitle: 'Medium',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/medium',
  },
  {
    id: 'p13',
    title: 'JavaScript array methods you will use every day',
    subtitle: 'freeCodeCamp',
    image:
      'https://daily-now-res.cloudinary.com/image/upload/t_logo,f_auto/v1628412854/logos/freecodecamp',
  },
  {
    id: 'p14',
    title: 'Secrets management for small teams',
    subtitle: 'The Next Web',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tnw',
  },
];

export const sampleTags: Hit[] = [
  { id: 'react', title: 'React' },
  { id: 'react-native', title: 'React Native' },
  { id: 'react-hooks', title: 'React Hooks' },
  { id: 'ai', title: 'AI' },
  { id: 'ai-agents', title: 'AI Agents' },
  { id: 'llm', title: 'LLM' },
  { id: 'python', title: 'Python' },
  { id: 'rust', title: 'Rust' },
  { id: 'javascript', title: 'JavaScript' },
  { id: 'typescript', title: 'TypeScript' },
  { id: 'devops', title: 'DevOps' },
  { id: 'docker', title: 'Docker' },
  { id: 'kubernetes', title: 'Kubernetes' },
  { id: 'css', title: 'CSS' },
  { id: 'nodejs', title: 'Node.js' },
  { id: 'career', title: 'Career' },
  { id: 'security', title: 'Security' },
];
