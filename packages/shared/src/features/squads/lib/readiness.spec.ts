import type { Squad } from '../../../graphql/sources';
import type { ProfileCompletion } from '../../../lib/user';
import {
  getCompanyPageReadinessItems,
  getPlanChecklistItems,
  isCompanyPageDescriptionReady,
  isCountedItem,
} from './readiness';
import { getCompanyPageReadinessPrompt } from './companyPage';

const profileCompletion: ProfileCompletion = {
  percentage: 40,
  hasProfileImage: true,
  hasHeadline: false,
  hasExperienceLevel: true,
  hasWork: false,
  hasEducation: false,
};

const squad = {
  handle: 'acme',
  image:
    'https://media.daily.dev/image/upload/s--LrHsyt2T--/f_auto/v1692632054/squad_placeholder_sfwkmj',
  description: 'Acme builds preview environments for every pull request.',
  headerImage: undefined,
  website: 'https://acme.dev',
  links: [],
} as unknown as Squad;

const missing = (items: ReturnType<typeof getCompanyPageReadinessItems>) =>
  items.filter(({ isDone }) => !isDone).map(({ id }) => id);

describe('isCompanyPageDescriptionReady', () => {
  it('counts an emoji as one character, as daily-api does', () => {
    expect(isCompanyPageDescriptionReady(`${'a'.repeat(18)}🚀`)).toBe(false);
    expect(isCompanyPageDescriptionReady(`${'a'.repeat(19)}🚀`)).toBe(true);
  });
});

describe('getCompanyPageReadinessItems', () => {
  it('lists a free page and its admin, counting the default image as no logo', () => {
    const items = getCompanyPageReadinessItems({
      squad,
      user: { profileCompletion },
      hasLinks: false,
    });

    expect(items.map(({ id }) => id)).toEqual([
      'logo',
      'description',
      'cover',
      'website',
      'photo',
      'headline',
      'job',
    ]);
    expect(missing(items)).toEqual(['logo', 'cover', 'headline', 'job']);
  });

  it('adds links and the product on a plan that has them', () => {
    const items = getCompanyPageReadinessItems({
      squad,
      user: { profileCompletion },
      hasLinks: true,
      products: 0,
    });

    expect(missing(items)).toEqual([
      'logo',
      'cover',
      'links',
      'product',
      'headline',
      'job',
    ]);
  });

  it('leaves out the profile rows when the profile is unknown', () => {
    const items = getCompanyPageReadinessItems({
      squad,
      user: {},
      hasLinks: false,
    });

    expect(items.map(({ group }) => group)).not.toContain('profile');
  });
});

describe('getCompanyPageReadinessPrompt', () => {
  it('works on the existing page and lists only the given steps', () => {
    const prompt = getCompanyPageReadinessPrompt({
      handle: 'acme',
      steps: ['Website: our homepage.'],
    });

    expect(prompt).toContain("update @acme and don't create a new one");
    expect(prompt).toContain('- Website: our homepage.');
  });
});

describe('getPlanChecklistItems', () => {
  const done = {
    cta: false,
    intel: false,
    post: true,
    boost: false,
    agent: false,
    strategy: false,
    ideas: true,
    review: false,
    routine: false,
  };

  it('gives a seat holder intel, the agent and its skills, and counts only what they do', () => {
    const items = getPlanChecklistItems({
      squad,
      hasSeat: true,
      hasCta: false,
      intelTopics: 5,
      credits: '$245',
      done,
    });

    expect(items.map(({ id }) => id)).toEqual([
      'intel',
      'post',
      'boost',
      'agent',
      'strategy',
      'ideas',
      'review',
      'routine',
      'indexed',
      'agent-views',
      'reach-notes',
    ]);
    expect(items.filter(isCountedItem).map(({ id }) => id)).not.toContain(
      'indexed',
    );
    expect(missing(items)).toEqual([
      'intel',
      'boost',
      'agent',
      'strategy',
      'review',
      'routine',
    ]);
    expect(items.find(({ id }) => id === 'boost')?.hint).toContain('$245');
  });

  it('leaves intel and the agent to seat holders and adds the CTA where the plan has it', () => {
    const ids = getPlanChecklistItems({
      squad,
      hasSeat: false,
      hasCta: true,
      done,
    }).map(({ id }) => id);

    expect(ids).toEqual([
      'cta',
      'post',
      'boost',
      'indexed',
      'agent-views',
      'reach-notes',
    ]);
  });
});
