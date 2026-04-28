import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { defaultQueryClientTestingConfig } from '../../../__tests__/helpers/tanstack-query';
import type { EngagementCreative } from '../../lib/engagementAds';
import { EngagementAdsProvider } from '../../contexts/EngagementAdsContext';
import { MentionedToolsWidget } from './MentionedToolsWidget';
import loggedUser from '../../../__tests__/fixture/loggedUser';

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
  tools: ['VSCode', 'GitHub'],
  keywords: ['AI'],
  tags: ['ai'],
};

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient(defaultQueryClientTestingConfig);
});

type RenderOpts = {
  postTags: string[];
  creatives?: EngagementCreative[];
  user?: typeof loggedUser | null;
  showLogin?: jest.Mock;
};

const renderWidget = ({
  postTags,
  creatives = [],
  user = loggedUser,
  showLogin,
}: RenderOpts) =>
  render(
    <TestBootProvider
      client={queryClient}
      auth={{
        user: user ?? undefined,
        isLoggedIn: !!user,
        showLogin: showLogin ?? jest.fn(),
      }}
    >
      <EngagementAdsProvider rawCreatives={creatives}>
        <MentionedToolsWidget postTags={postTags} />
      </EngagementAdsProvider>
    </TestBootProvider>,
  );

describe('MentionedToolsWidget', () => {
  it('renders nothing when no creative matches the post tags', () => {
    const { container } = renderWidget({
      postTags: ['react'],
      creatives: [creative],
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when creative has no tools', () => {
    const creativeWithoutTools = { ...creative, tools: [] };
    const { container } = renderWidget({
      postTags: ['ai'],
      creatives: [creativeWithoutTools],
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('lists each tool from the matching creative', () => {
    renderWidget({ postTags: ['ai'], creatives: [creative] });
    expect(screen.getByText('Mentioned tools')).toBeInTheDocument();
    expect(screen.getByText('VSCode')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('prompts anonymous users to log in when a tool is clicked', async () => {
    const showLogin = jest.fn();
    renderWidget({
      postTags: ['ai'],
      creatives: [creative],
      user: null,
      showLogin,
    });

    await userEvent.click(screen.getByText('VSCode'));
    expect(showLogin).toHaveBeenCalledWith(
      expect.objectContaining({ trigger: 'add to stack' }),
    );
  });
});
