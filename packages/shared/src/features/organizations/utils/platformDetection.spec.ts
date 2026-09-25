import { OrganizationLinkType } from '../types';
import { detectPlatform } from './platformDetection';

describe('detectPlatform', () => {
  it('should detect TechCrunch press links by exact domain', () => {
    expect(detectPlatform('https://techcrunch.com/2026/09/21/story')).toEqual({
      platform: 'TechCrunch',
      socialType: null,
      linkType: OrganizationLinkType.Press,
      defaultLabel: 'Press Release',
    });
  });

  it('should not detect press domains by substring', () => {
    expect(
      detectPlatform('https://mytechcrunch.com/2026/09/21/story'),
    ).toBeNull();
    expect(
      detectPlatform('https://techcrunch.com.attacker.example/story'),
    ).toBeNull();
  });
});
