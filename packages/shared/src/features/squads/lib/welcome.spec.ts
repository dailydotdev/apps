import { getSquadWelcomeExamples, getSquadWelcomeView } from './welcome';
import { emptySquadWelcome } from '../../../graphql/squadWelcomeAudience';

const squad = {
  name: 'CodeRabbit',
  image: 'https://media.daily.dev/logo.png',
  headerImage: 'https://media.daily.dev/cover.png',
  rules: [
    { title: 'Stay on topic' },
    { title: 'Be useful' },
    { title: 'No spam' },
    { title: 'Be kind' },
  ],
};

describe('getSquadWelcomeView', () => {
  it('should fall back to the squad for anything left empty', () => {
    expect(getSquadWelcomeView(emptySquadWelcome, squad)).toEqual({
      coverUrl: 'https://media.daily.dev/cover.png',
      imageUrl: 'https://media.daily.dev/logo.png',
      headline: 'Welcome to CodeRabbit',
      text: null,
      rules: [],
      ctaLabel: 'Got it',
      ctaUrl: null,
    });
  });

  it('should show the first three rules and the company’s own fields', () => {
    expect(
      getSquadWelcomeView(
        {
          ...emptySquadWelcome,
          headline: 'Hi',
          showRules: true,
          ctaUrl: 'https://coderabbit.ai',
          coverUrl: 'https://media.daily.dev/welcome.png',
        },
        squad,
      ),
    ).toMatchObject({
      coverUrl: 'https://media.daily.dev/welcome.png',
      headline: 'Hi',
      rules: ['Stay on topic', 'Be useful', 'No spam'],
      ctaLabel: 'Open',
      ctaUrl: 'https://coderabbit.ai',
    });
  });
});

describe('getSquadWelcomeExamples', () => {
  it('should offer four starting points that fit the limits', () => {
    const examples = getSquadWelcomeExamples(squad);

    expect(examples.map(({ label }) => label)).toEqual([
      'Default',
      'An event',
      'A product',
      'A launch',
    ]);
    examples.forEach(({ text }) => {
      expect((text.headline ?? '').length).toBeLessThanOrEqual(60);
      expect((text.text ?? '').length).toBeLessThanOrEqual(160);
      expect((text.ctaLabel ?? '').length).toBeLessThanOrEqual(24);
    });
  });
});
