import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FunnelSocialProof as Step } from './FunnelSocialProof';
import type { FunnelStepSocialProof } from '../types/funnel';
import { FunnelStepType } from '../types/funnel';
import { useIsLightTheme } from '../../../hooks/utils';

// Add useIsLightTheme mock
jest.mock('../../../hooks/utils', () => ({
  useIsLightTheme: jest.fn(),
}));

const mockOnTransition = jest.fn();

const defaultProps: FunnelStepSocialProof = {
  id: 'test-id',
  type: FunnelStepType.SocialProof,
  transitions: [],
  onTransition: mockOnTransition,
  parameters: {
    imageUrl:
      'https://media.daily.dev/image/upload/s--44oMC43t--/f_auto/v1743947482/public/Rating',
    imageUrlLightMode:
      'https://media.daily.dev/image/upload/s--44oMC43t--/f_auto/v1743947482/public/Rating-light',
    rating: '4.8/5',
    reviewSubtitle: 'based on 2,598+ reviews',
    reviews: [
      {
        title: 'Perfect for Busy People',
        content:
          '"I used to spend hours sifting through Hacker News, Reddit, and newsletters. Now, I get everything I need in one place."',
        author: 'Priya, Full-Stack Dev',
      },
      {
        title: 'Quality Content',
        content:
          '"daily.dev is my go-to dev feed. No fluff, no clickbait—just quality."',
        author: 'Alex, Senior Engineer',
      },
      {
        title: 'Saved My Time',
        content:
          '"As a tech lead, staying updated is crucial. daily.dev curates the most relevant content so I don\'t miss anything important."',
        author: 'Michael, Tech Lead',
      },
      {
        title: 'Great for Learning',
        content:
          '"The personalized feed helps me discover new technologies and best practices that I wouldn\'t have found otherwise."',
        author: 'Sarah, Junior Developer',
      },
    ],
    cta: 'Continue',
  },
};

const renderComponent = (props = {}) => {
  return render(<Step {...defaultProps} {...props} />);
};

describe('FunnelSocialProof', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useIsLightTheme as jest.Mock).mockReturnValue(false);
  });

  it('should call onTransition when button is clicked', async () => {
    renderComponent();
    const button = await screen.findByText('Continue');
    fireEvent.click(button);
    expect(mockOnTransition).toHaveBeenCalledTimes(1);
  });

  it('should use "Next" as default CTA text when not provided', async () => {
    renderComponent({
      parameters: {
        ...defaultProps.parameters,
        cta: undefined,
      },
    });
    expect(await screen.findByText('Next')).toBeInTheDocument();
  });

  it('should render dark mode image when in dark mode', async () => {
    // Mock dark mode
    (useIsLightTheme as jest.Mock).mockReturnValue(false);

    const darkModeUrl = 'https://example.com/dark-image.png';
    const lightModeUrl = 'https://example.com/light-image.png';

    renderComponent({
      parameters: {
        ...defaultProps.parameters,
        imageUrl: darkModeUrl,
        imageUrlLightMode: lightModeUrl,
      },
    });

    const image = screen.getByAltText('Social proof illustration');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', darkModeUrl);
  });

  it('should render light mode image when in light mode', async () => {
    // Mock light mode
    (useIsLightTheme as jest.Mock).mockReturnValue(true);

    const darkModeUrl = 'https://example.com/dark-image.png';
    const lightModeUrl = 'https://example.com/light-image.png';

    renderComponent({
      parameters: {
        ...defaultProps.parameters,
        imageUrl: darkModeUrl,
        imageUrlLightMode: lightModeUrl,
      },
    });

    const image = screen.getByAltText('Social proof illustration');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', lightModeUrl);
  });
});
