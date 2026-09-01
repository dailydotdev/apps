import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { featurePostCopySummary } from '../../lib/featureManagement';
import { useSharePlacement } from './useSharePlacement';

const Probe = ({ shouldEvaluate }: { shouldEvaluate?: boolean }) => {
  const enabled = useSharePlacement({
    feature: featurePostCopySummary,
    shouldEvaluate,
  });

  return <span>{enabled ? 'on' : 'off'}</span>;
};

const renderProbe = (gb?: GrowthBook, shouldEvaluate?: boolean) =>
  render(
    <TestBootProvider client={new QueryClient()} gb={gb}>
      <Probe shouldEvaluate={shouldEvaluate} />
    </TestBootProvider>,
  );

const setHostname = (hostname: string) => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, hostname },
  });
};

const flagOn = () => {
  const gb = new GrowthBook();
  gb.setFeatures({ [featurePostCopySummary.id]: { defaultValue: true } });

  return gb;
};

describe('useSharePlacement', () => {
  afterEach(() => setHostname('localhost'));

  it('follows the flag on the production host', () => {
    setHostname('app.daily.dev');

    renderProbe(flagOn());

    expect(screen.getByText('on')).toBeInTheDocument();
  });

  it('stays off on the production host when the flag is off', () => {
    setHostname('app.daily.dev');

    renderProbe();

    expect(screen.getByText('off')).toBeInTheDocument();
  });

  it('opens itself on a branch preview, where no flag can be reached', () => {
    setHostname('my-branch.preview.app.daily.dev');

    renderProbe();

    expect(screen.getByText('on')).toBeInTheDocument();
  });

  it('opens itself on the Vercel host, which serves the same deployment', () => {
    setHostname('daily-webapp-git-my-branch-dailydotdev.vercel.app');

    renderProbe();

    expect(screen.getByText('on')).toBeInTheDocument();
  });

  it('respects a surface that opted out, even on a preview', () => {
    setHostname('my-branch.preview.app.daily.dev');

    renderProbe(undefined, false);

    expect(screen.getByText('off')).toBeInTheDocument();
  });
});
