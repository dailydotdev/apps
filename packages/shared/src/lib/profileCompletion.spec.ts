import {
  formatCompletionDescription,
  getCompletionItems,
  getIncompleteCompletionItems,
} from './profileCompletion';
import type { ProfileCompletion } from './user';

const profileCompletion: ProfileCompletion = {
  percentage: 20,
  hasProfileImage: false,
  hasHeadline: false,
  hasExperienceLevel: true,
  hasWork: false,
  hasEducation: true,
};

describe('profileCompletion', () => {
  it('should return completion items in the expected priority order', () => {
    expect(
      getCompletionItems(profileCompletion).map((item) => item.label),
    ).toEqual([
      'Profile image',
      'Headline',
      'Experience level',
      'Work experience',
      'Education',
    ]);
  });

  it('should return only incomplete completion items', () => {
    expect(
      getIncompleteCompletionItems(profileCompletion).map((item) => item.label),
    ).toEqual(['Profile image', 'Headline', 'Work experience']);
  });

  it('should format a single incomplete item description', () => {
    expect(
      formatCompletionDescription([
        {
          label: 'Headline',
          completed: false,
          redirectPath: '/settings/profile?field=bio',
        },
      ]),
    ).toBe('Add Headline.');
  });

  it('should format a multi-item incomplete description', () => {
    expect(
      formatCompletionDescription(
        getIncompleteCompletionItems(profileCompletion),
      ),
    ).toBe('Add Profile image, Headline and Work experience.');
  });

  it('should format the completed state description', () => {
    expect(formatCompletionDescription([])).toBe('Profile completed!');
  });
});
