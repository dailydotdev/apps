import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { fullPost } from '../../history/posts';
import postPages from '../../history/postPages.json';
import { defaultParams } from './policy/params';
import type { PersonalizationState } from './policy/rank';

/**
 * Every article and video from the /history story: real titles, sources,
 * tags, reactions and views as the API returned them. The policy picks the
 * For You page from these.
 */
export const candidatePool: Post[] = Object.keys(postPages)
  .map(fullPost)
  .filter(({ type }) => type === 'article' || type === 'video:youtube');

export enum PersonaId {
  TwoWeeksIn = 'two_weeks_in',
  JustSignedUp = 'just_signed_up',
}

export interface Persona {
  id: PersonaId;
  label: string;
  description: string;
  state: PersonalizationState;
}

const baseState: PersonalizationState = {
  followedTags: [],
  blockedTags: [],
  followedSources: [],
  blockedSources: [],
  followedAuthors: [],
  blockedAuthors: [],
  evidence: [],
  isLearning: true,
  controls: {},
  sourceControls: {},
  params: defaultParams,
  isFillingWithPopular: true,
  hidden: [],
  impressions: {},
  tagShownDays: {},
};

export const personas: Record<PersonaId, Persona> = {
  [PersonaId.TwoWeeksIn]: {
    id: PersonaId.TwoWeeksIn,
    label: 'Two weeks in',
    description:
      'Followed #webdev, #react and #ai at sign-up, then read a lot about careers and some Rust and Docker.',
    state: {
      ...baseState,
      followedTags: ['webdev', 'react', 'ai'],
      followedSources: ['fireship'],
      evidence: [
        { topic: 'ai', stories: 7, strongStories: 2, daysSinceLastAction: 1 },
        {
          topic: 'career',
          stories: 6,
          strongStories: 1,
          daysSinceLastAction: 2,
        },
        {
          topic: 'ai-coding',
          stories: 4,
          strongStories: 0,
          daysSinceLastAction: 3,
        },
        {
          topic: 'webdev',
          stories: 3,
          strongStories: 0,
          daysSinceLastAction: 4,
        },
        { topic: 'rust', stories: 3, strongStories: 1, daysSinceLastAction: 6 },
        {
          topic: 'docker',
          stories: 2,
          strongStories: 0,
          daysSinceLastAction: 12,
        },
        {
          topic: 'productivity',
          stories: 2,
          strongStories: 0,
          daysSinceLastAction: 30,
        },
        { topic: 'react', stories: 1, strongStories: 0, daysSinceLastAction: 9 },
        { topic: 'linux', stories: 1, strongStories: 0, daysSinceLastAction: 5 },
        { topic: 'css', stories: 1, strongStories: 0, daysSinceLastAction: 20 },
      ],
      impressions: { DVZBShH7e: 2, KfPEpQdOl: 1, mGfmauFls: 6 },
      tagShownDays: { ai: 0.3, career: 0.5, webdev: 1 },
    },
  },
  [PersonaId.JustSignedUp]: {
    id: PersonaId.JustSignedUp,
    label: 'Just signed up',
    description:
      'Picked #react and #rust in onboarding and has not read anything yet.',
    state: {
      ...baseState,
      followedTags: ['react', 'rust'],
    },
  },
};
