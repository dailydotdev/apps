import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProfileCompletionPostGate } from './ProfileCompletionPostGate';

describe('ProfileCompletionPostGate', () => {
  it('should render missing profile items when profile completion is available', () => {
    render(
      <ProfileCompletionPostGate
        currentPercentage={20}
        requiredPercentage={70}
        description="Add your profile details to keep post creation available."
        profileCompletion={{
          percentage: 20,
          hasProfileImage: false,
          hasHeadline: false,
          hasExperienceLevel: true,
          hasWork: false,
          hasEducation: true,
        }}
      />,
    );

    expect(
      screen.getByText('Add Profile image, Headline and Work experience.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('You are 50% away from the 70% requirement.'),
    ).not.toBeInTheDocument();
  });

  it('should fall back to the percentage requirement message when profile completion is missing', () => {
    render(
      <ProfileCompletionPostGate
        currentPercentage={20}
        requiredPercentage={70}
        description="Add your profile details to keep post creation available."
      />,
    );

    expect(
      screen.getByText('You are 50% away from the 70% requirement.'),
    ).toBeInTheDocument();
  });

  it('should keep the profile CTA destination unchanged', () => {
    render(
      <ProfileCompletionPostGate
        currentPercentage={20}
        requiredPercentage={70}
        description="Add your profile details to keep post creation available."
      />,
    );

    expect(
      screen.getByRole('link', { name: 'Complete profile' }),
    ).toHaveAttribute('href', '/settings/profile');
  });
});
