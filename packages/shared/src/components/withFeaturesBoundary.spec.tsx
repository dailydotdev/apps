import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeaturesReadyContext } from './GrowthBookProvider';
import { withFeaturesBoundary } from './withFeaturesBoundary';

describe('withFeaturesBoundary', () => {
  it('should return a component that renders the wrapped component if features are ready', async () => {
    const Component = withFeaturesBoundary(() => <div>Features ready</div>);
    render(
      <FeaturesReadyContext.Provider value={{ ready: true }}>
        <Component />
      </FeaturesReadyContext.Provider>,
    );

    const element = await screen.findByText('Features ready');

    expect(element).toBeInTheDocument();
  });

  it('should return a component that renders the fallback if features are not ready', async () => {
    const Component = withFeaturesBoundary(() => <div />, {
      fallback: <div>Fallback</div>,
    });
    render(
      <FeaturesReadyContext.Provider value={{ ready: false }}>
        <Component />
      </FeaturesReadyContext.Provider>,
    );

    const fallbackElement = await screen.findByText('Fallback');

    expect(fallbackElement).toBeInTheDocument();
  });
});
