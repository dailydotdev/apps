import React from 'react';
import { render, screen } from '@testing-library/react';
import SwipeOnboardingModal from './SwipeOnboardingModal';

jest.mock('../../hooks/useRequestProtocol', () => ({
  useRequestProtocol: () => ({ isCompanion: false }),
}));

describe('SwipeOnboardingModal', () => {
  it('should keep the deck clipped and scrollable inside the modal shell', () => {
    render(
      <SwipeOnboardingModal
        isOpen
        onRequestClose={jest.fn()}
        ariaHideApp={false}
        onboardingCards={[
          {
            id: 'onboarding-card-1',
            title: 'Figma launches MCP tool for AI agents to design on canvas',
            summary:
              'A generated TLDR keeps the onboarding card readable while the modal stays within its shell.',
            tags: ['ai-agents', 'figma', 'mcp'],
            source: { name: 'daily.dev' },
          },
        ]}
        topSlot={<div>Progress header</div>}
        bottomSlot={<div>Starter feed ready</div>}
      />,
    );

    const modalBody = document.querySelector('section');
    expect(modalBody).toHaveClass('overflow-y-auto', 'overflow-x-hidden');
    expect(modalBody).not.toHaveClass(
      'tablet:!overflow-x-visible',
      'tablet:!overflow-y-visible',
    );

    // The onboarding panel duplicates its swipe actions (one block for
    // mobile, one for tablet) so the row stays visible at every breakpoint;
    // JSDOM renders both, so just assert presence of at least one of each.
    expect(
      screen.getAllByRole('button', { name: 'Not interesting' })[0],
    ).toBeVisible();
    expect(
      screen.getAllByRole('button', { name: 'Interesting' })[0],
    ).toBeVisible();
    expect(
      screen.getAllByRole('img', { name: 'daily.dev source icon' })[0],
    ).toBeVisible();
    expect(screen.getAllByText('Starter feed ready')[0]).toBeVisible();
  });
});
