import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { defaultQueryClientTestingConfig } from '../../../__tests__/helpers/tanstack-query';
import type { EngagementCreative } from '../../lib/engagementAds';
import { EngagementAdsProvider } from '../../contexts/EngagementAdsContext';
import { BrandedTag } from './BrandedTag';

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
  keywords: ['AI'],
  tags: ['ai'],
};

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient(defaultQueryClientTestingConfig);
});

const renderTag = (tag: string, creatives: EngagementCreative[] = []) =>
  render(
    <TestBootProvider client={queryClient}>
      <EngagementAdsProvider rawCreatives={creatives}>
        <BrandedTag tag={tag} />
      </EngagementAdsProvider>
    </TestBootProvider>,
  );

describe('BrandedTag', () => {
  it('renders plain #tag when no creative matches', () => {
    renderTag('react');
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.queryByAltText('Copilot')).not.toBeInTheDocument();
  });

  it('renders brand name and logo when the tag is sponsored', () => {
    renderTag('ai', [creative]);
    expect(screen.getByText('#ai - powered by Copilot')).toBeInTheDocument();
    // Don't pin the theme: either dark or light resolution is acceptable
    expect(screen.getByAltText('Copilot')).toHaveAttribute(
      'src',
      expect.stringMatching(/https:\/\/example\.com\/logo-(dark|light)\.png/),
    );
  });

  it('falls back to plain tag when branding is disabled', () => {
    render(
      <TestBootProvider client={queryClient}>
        <EngagementAdsProvider rawCreatives={[creative]}>
          <BrandedTag tag="ai" disableBranding />
        </EngagementAdsProvider>
      </TestBootProvider>,
    );
    expect(screen.getByText('#ai')).toBeInTheDocument();
    expect(screen.queryByText(/powered by/)).not.toBeInTheDocument();
  });
});
