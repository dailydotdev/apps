import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { AgentProvider } from '../AgentContext';
import { AgentUsageMeter } from './AgentUsageMeter';

const renderMeter = (isDemo: boolean) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <AgentProvider id="a1" isDemo={isDemo} initialMessages={[]}>
        <AgentUsageMeter />
      </AgentProvider>
    </TestBootProvider>,
  );

/**
 * The allowances are invented. Shown on the live route they told a reader they
 * had spent 6 of 10 runs against a quota nothing measures, with a paid upgrade
 * attached to it.
 */
describe('the usage meter', () => {
  it('claims no quota it cannot measure', () => {
    const { container } = renderMeter(false);

    expect(container).toBeEmptyDOMElement();
  });

  it('is part of the demo surface', () => {
    renderMeter(true);

    expect(screen.getByLabelText('Agent usage')).toBeInTheDocument();
  });
});
