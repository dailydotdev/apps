import { getSquadMembersLabel } from './common';

describe('getSquadMembersLabel', () => {
  it('should leave the label out when the count is unknown', () => {
    expect(getSquadMembersLabel(undefined)).toBeNull();
    expect(getSquadMembersLabel(null)).toBeNull();
  });

  it('should call a squad under the threshold new', () => {
    expect(getSquadMembersLabel(0)).toBe('New Squad');
    expect(getSquadMembersLabel(49)).toBe('New Squad');
  });

  it('should format the count from the threshold up', () => {
    expect(getSquadMembersLabel(50)).toBe('50 members');
    expect(getSquadMembersLabel(42700)).toBe('42.7K members');
  });
});
