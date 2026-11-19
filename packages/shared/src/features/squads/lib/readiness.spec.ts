import type { Squad } from '../../../graphql/sources';
import type { ProfileCompletion } from '../../../lib/user';
import { getCompanyPageReadinessItems } from './readiness';
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
  description: 'We build Acme',
  headerImage: undefined,
  website: 'https://acme.dev',
  links: [],
} as unknown as Squad;

const missing = (items: ReturnType<typeof getCompanyPageReadinessItems>) =>
  items.filter(({ isDone }) => !isDone).map(({ id }) => id);

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
