import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FeaturesReadyContext } from './GrowthBookProvider';
import { withFeaturesBoundary } from './withFeaturesBoundary';

const renderComponent = (Component: React.ElementType, ready = true) => {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <FeaturesReadyContext.Provider value={{ ready }}>
        <Component />
      </FeaturesReadyContext.Provider>
      ,
    </QueryClientProvider>,
  );
};

describe('withFeaturesBoundary', () => {
  it('should return a component that renders the wrapped component if features are ready', async () => {
    const Component = withFeaturesBoundary(() => <div>Features ready</div>);
    renderComponent(Component);

    const element = await screen.findByText('Features ready');

    expect(element).toBeInTheDocument();
  });

  it('should return a component that renders the fallback if features are not ready', async () => {
    const Component = withFeaturesBoundary(() => <div />, {
      fallback: () => <div>Fallback</div>,
    });

    renderComponent(Component, false);

    const fallbackElement = await screen.findByText('Fallback');

    expect(fallbackElement).toBeInTheDocument();
  });
});
