import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { AgentProvider } from '../AgentContext';
import { mockActivity } from '../mock';
import { AgentActivitySection } from './AgentActivitySection';

const renderActivity = (isDemo: boolean) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <AgentProvider id="a1" isDemo={isDemo} initialMessages={[]}>
        <AgentActivitySection />
      </AgentProvider>
    </TestBootProvider>,
  );

const aMockEntry = () => screen.queryByText(mockActivity[0].text);

/**
 * Fabricated runs read exactly like real ones once they are in the list, so a
 * reader has no way to tell which of their agent's history actually happened.
 */
describe('the activity tab', () => {
  it('never attributes invented runs to a real agent', () => {
    renderActivity(false);

    expect(aMockEntry()).not.toBeInTheDocument();
  });

  it('says so plainly instead of filling the space', () => {
    renderActivity(false);

    expect(screen.getByText(/Nothing yet/i)).toBeInTheDocument();
  });

  it('still carries the scripted history on the demo surface', () => {
    renderActivity(true);

    expect(aMockEntry()).toBeInTheDocument();
  });
});
