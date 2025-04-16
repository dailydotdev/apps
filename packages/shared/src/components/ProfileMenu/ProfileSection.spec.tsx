import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProfileSection } from './ProfileSection';
import { ProfileSectionItem } from './ProfileSectionItem';

// Mock the ProfileSectionItem component
jest.mock('./ProfileSectionItem', () => ({
  ProfileSectionItem: jest.fn(() => <div data-testid="profile-section-item" />),
}));

describe('ProfileSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with items', () => {
    const items = [
      { title: 'Item 1' },
      { title: 'Item 2' },
      { title: 'Item 3' },
    ];

    render(<ProfileSection items={items} />);

    // Check that the section is rendered
    const sectionItems = screen.getAllByTestId('profile-section-item');
    expect(sectionItems).toHaveLength(3);

    // Check that ProfileSectionItem was called with the correct props
    expect(ProfileSectionItem).toHaveBeenCalledTimes(3);
    expect(ProfileSectionItem).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Item 1' }),
      expect.anything(),
    );
    expect(ProfileSectionItem).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Item 2' }),
      expect.anything(),
    );
    expect(ProfileSectionItem).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Item 3' }),
      expect.anything(),
    );
  });

  it('should render empty section when items array is empty', () => {
    render(<ProfileSection items={[]} />);

    // Check that no items are rendered
    const sectionItems = screen.queryByTestId('profile-section-item');
    expect(sectionItems).not.toBeInTheDocument();

    // Verify ProfileSectionItem wasn't called
    expect(ProfileSectionItem).not.toHaveBeenCalled();
  });
});
