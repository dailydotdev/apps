import React from 'react';
import { render, screen } from '@testing-library/react';
import { FunnelStepCtaWrapper } from './FunnelStepCtaWrapper';
import { FunnelProgressContext } from './FunnelStepDots';

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useViewSize: () => false,
}));

const renderStep = (props: { isCtaPinned?: boolean } = {}) =>
  render(
    <FunnelProgressContext.Provider
      value={{
        chapters: [{ steps: 2 }],
        position: { chapter: 0, step: 0 },
        isOnboarding: true,
      }}
    >
      <FunnelStepCtaWrapper isGlass {...props}>
        <p>Step content</p>
      </FunnelStepCtaWrapper>
    </FunnelProgressContext.Provider>,
  );

const getContent = () => screen.getByText('Step content').parentElement;

describe('FunnelStepCtaWrapper', () => {
  // The rail is sticky to the bottom; whether it sits on the bottom edge or
  // right under the content depends only on the content stretching.
  it('lets the CTA follow the content from tablet up', () => {
    renderStep();

    expect(getContent()).toHaveClass('flex-1', 'tablet:flex-none');
  });

  it('keeps a pinned CTA on the bottom edge at every width', () => {
    renderStep({ isCtaPinned: true });

    expect(getContent()).toHaveClass('flex-1');
    expect(getContent()).not.toHaveClass('tablet:flex-none');
  });
});
