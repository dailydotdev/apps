import { getContentTypeNotEmpty, withoutRetiredTitles } from './helpers';
import type { AdvancedSettings } from '../../../graphql/feedSettings';
import { AdvancedSettingsGroup } from '../../../graphql/feedSettings';

// The two titles the funnel retires, verbatim from the `advancedSettings`
// query. They join on display copy, so a backend rename un-retires the cards
// silently — this fixture is the tripwire: update it to match a rename and
// these tests go red, which is the signal to re-key the filter.
const RETIRED = ['Community picks', 'Standups'];

const settings: AdvancedSettings[] = [
  {
    id: 8,
    title: 'Community picks',
    description: 'Posts submitted by community members.',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentSource,
    options: { source: { id: 'community', handle: 'community' } },
  },
  {
    id: 25,
    title: 'Standups',
    description: 'Live standup posts.',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentTypes,
  },
  {
    id: 9,
    title: 'News',
    description: 'Reports on tech industry events.',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentCuration,
  },
] as AdvancedSettings[];

describe('withoutRetiredTitles', () => {
  it('drops the retired titles in the onboarding funnel', () => {
    const kept = withoutRetiredTitles(settings, true).map(({ title }) => title);

    expect(kept).toEqual(['News']);
  });

  it('keeps them everywhere else', () => {
    expect(withoutRetiredTitles(settings, false)).toHaveLength(3);
    expect(withoutRetiredTitles(settings)).toHaveLength(3);
  });

  it('still matches the titles it is meant to retire', () => {
    const titles = settings.map(({ title }) => title);

    RETIRED.forEach((title) => expect(titles).toContain(title));
  });
});

describe('getContentTypeNotEmpty', () => {
  const checkSourceBlocked = () => true;

  // The gate has to see the same list the step draws. Counting a retired card
  // would let the CTA enable with nothing visibly selected.
  it('does not count a retired card as a selection in the funnel', () => {
    expect(
      getContentTypeNotEmpty({
        advancedSettings: settings,
        selectedSettings: { 8: true, 25: true, 9: false },
        checkSourceBlocked,
        isOnboarding: true,
      }),
    ).toBe(false);
  });

  it('counts a card the step does draw', () => {
    expect(
      getContentTypeNotEmpty({
        advancedSettings: settings,
        selectedSettings: { 8: false, 25: false, 9: true },
        checkSourceBlocked,
        isOnboarding: true,
      }),
    ).toBe(true);
  });
});
