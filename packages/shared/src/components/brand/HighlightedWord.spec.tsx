import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { defaultQueryClientTestingConfig } from '../../../__tests__/helpers/tanstack-query';
import type { EngagementCreative } from '../../lib/engagementAds';
import { EngagementAdsProvider } from '../../contexts/EngagementAdsContext';
import { HighlightedBrandText, HighlightedWord } from './HighlightedWord';

const creative: EngagementCreative = {
  gen_id: 'c1',
  promoted_name: 'Copilot',
  promoted_body: 'AI pair programming',
  promoted_cta: 'Try free',
  promoted_url: 'https://example.com',
  promoted_logo_img: {
    dark: 'https://example.com/logo-dark.png',
    light: 'https://example.com/logo-light.png',
  },
  promoted_icon_img: {
    dark: 'https://example.com/icon-dark.png',
    light: 'https://example.com/icon-light.png',
  },
  promoted_gradient_start: { dark: '#000', light: '#fff' },
  promoted_gradient_end: { dark: '#111', light: '#eee' },
  tools: ['vscode'],
  keywords: ['Copilot'],
  tags: ['ai'],
};

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient(defaultQueryClientTestingConfig);
});

const wrap = (
  children: React.ReactNode,
  creatives: EngagementCreative[] = [],
) =>
  render(
    <TestBootProvider client={queryClient}>
      <EngagementAdsProvider rawCreatives={creatives}>
        {children}
      </EngagementAdsProvider>
    </TestBootProvider>,
  );

describe('HighlightedWord', () => {
  it('renders the word as plain text when it matches nothing', () => {
    wrap(<HighlightedWord word="React" />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('wraps the word with a tooltip trigger span when matched', () => {
    wrap(<HighlightedWord word="Copilot" />, [creative]);
    const span = screen.getByText('Copilot');
    // The trigger is the styled span; plain text would render as a fragment
    expect(span.tagName).toBe('SPAN');
    expect(span.className).toMatch(/cursor-pointer/);
  });
});

describe('HighlightedBrandText', () => {
  it('renders plain text when no keyword matches', () => {
    wrap(<HighlightedBrandText text="Learn React today" />, [creative]);
    expect(screen.getByText('Learn React today')).toBeInTheDocument();
  });

  it('wraps the first matched keyword and leaves the surrounding text intact', () => {
    const { container } = wrap(
      <HighlightedBrandText text="Try Copilot for AI coding" />,
      [creative],
    );
    // The full sentence is still readable end-to-end
    expect(container).toHaveTextContent('Try Copilot for AI coding');
    // And the keyword is the element we highlight
    const highlighted = screen.getByText('Copilot');
    expect(highlighted.tagName).toBe('SPAN');
    expect(highlighted.className).toMatch(/cursor-pointer/);
  });
});
