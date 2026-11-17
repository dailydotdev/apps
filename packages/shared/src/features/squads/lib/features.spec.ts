import { showsVerifiedBadge } from './features';

describe('showsVerifiedBadge', () => {
  it.each([
    { name: 'hides it without verified', features: {}, expected: false },
    {
      name: 'falls back to verified',
      features: { verified: true },
      expected: true,
    },
    {
      name: 'hides it when the admins turned it off',
      features: { verified: true, showVerifiedBadge: false },
      expected: false,
    },
    {
      name: 'shows it when the API says so',
      features: { verified: true, showVerifiedBadge: true },
      expected: true,
    },
  ])('$name', ({ features, expected }) => {
    expect(showsVerifiedBadge({ features })).toBe(expected);
  });
});
