import React from 'react';
import { render as renderWithProviders, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GivebackPage } from './GivebackPage';
import { GivebackProvider } from '../GivebackContext';
import { GivebackNavProvider } from '../GivebackNavContext';
import { CommunityGoalProgress } from './CommunityGoalProgress';
import { GivebackReviewToggle } from './GivebackReviewToggle';
import { ActionCatalog } from './ActionCatalog';
import { GivebackLeaderboard } from './GivebackLeaderboard';
import { GivebackCelebration } from './GivebackCelebration';
import { CauseSelection } from './CauseSelection';
import { CommunityImpactSection } from './CommunityImpactSection';
import { GivebackCommunityActivity } from './GivebackCommunityActivity';
import { GeoGateFallback } from './GeoGateFallback';

// The giveback page always renders under a QueryClientProvider in the app, and
// the modals portal through RootPortal (which reads the request protocol from
// the query client). Wrap every render so that dependency is always satisfied.
const render = (
  ui: React.ReactElement,
): ReturnType<typeof renderWithProviders> =>
  renderWithProviders(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>,
  );

describe('GivebackPage', () => {
  it('reveals the tabbed experience after opting in from the hero gateway', async () => {
    render(<GivebackPage />);

    expect(
      screen.getByText(/Grow the community\. Redirect the budget\./),
    ).toBeInTheDocument();
    expect(screen.getByText('Fund good causes.')).toBeInTheDocument();
    expect(screen.getByText('Join the campaign')).toBeInTheDocument();

    // Tabs stay hidden until the visitor opts in.
    expect(
      screen.queryByRole('tab', { name: 'Impact' }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Join the campaign' }),
    );

    // Onboarding: pick causes first, with no tabs revealed yet.
    expect(
      screen.getByText('You pick causes you care about.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continue' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: 'Take action' }),
    ).not.toBeInTheDocument();

    // Confirming causes reveals the tabs, starting on "Take action".
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(
      screen.getByRole('heading', { name: /Take a small action/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/genuinely\s+appreciate them/)).toBeInTheDocument();

    // Causes is no longer a tab or a gear button — the picked causes are
    // recapped on the Why tab, where they can be suggested or edited.
    expect(
      screen.queryByRole('tab', { name: 'Causes' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Causes' }),
    ).not.toBeInTheDocument();

    // Leaderboard is no longer its own tab — it lives inside Impact alongside
    // community progress, live activity, and the personal journey.
    expect(
      screen.queryByRole('tab', { name: 'Leaderboard' }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Impact' }));
    expect(
      screen.getByText('See the impact we build together.'),
    ).toBeInTheDocument();
    // The leaderboard (weekly board + your rank) now renders inside Impact.
    expect(screen.getByText('Weekly leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Your rank')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: "You're a Helping hand" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Campaign' }));
    expect(screen.getByText('Big tech buys ads.')).toBeInTheDocument();
    // The picked causes are recapped here, with suggest/edit actions.
    expect(
      screen.getByText('Where your actions send the money'),
    ).toBeInTheDocument();
    // The FAQ now lives at the bottom of the Campaign tab (no separate tab).
    expect(screen.getByText('Frequently asked questions')).toBeInTheDocument();
    expect(screen.getByText('Does this cost me anything?')).toBeInTheDocument();
    expect(screen.getByText('Still have a question?')).toBeInTheDocument();

    // Updates, Comments and FAQ tabs were removed — live activity moved to
    // Impact and the FAQ is folded into the Campaign tab.
    expect(
      screen.queryByRole('tab', { name: 'Updates' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: 'Comments' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'FAQ' })).not.toBeInTheDocument();
  });

  it('recaps selected causes on the Campaign tab and edits them in a portal', async () => {
    render(<GivebackPage />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Join the campaign' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await userEvent.click(screen.getByRole('tab', { name: 'Campaign' }));

    expect(
      screen.getByText('Where your actions send the money'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByText('Customize your causes')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Python Software Foundation/ }),
    ).toBeInTheDocument();
  });

  it('lets a visitor send a question from the FAQ on the Campaign tab', async () => {
    render(<GivebackPage />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Join the campaign' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await userEvent.click(screen.getByRole('tab', { name: 'Campaign' }));

    await userEvent.type(
      screen.getByLabelText('Your question'),
      'When do donations get sent?',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Send question' }),
    );

    expect(screen.getByText(/we'll get back to you soon/)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Send question' }),
    ).not.toBeInTheDocument();
  });

  it('shows the mocked goal progress at 50% after opting in', async () => {
    render(<GivebackPage />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Join the campaign' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await userEvent.click(screen.getByRole('tab', { name: 'Impact' }));

    expect(screen.getAllByText('$5,000')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/pledged of\s+\$10,000/).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText('50% funded')).toBeInTheDocument();
  });

  it('windows the level journey and reveals more on demand', async () => {
    render(<GivebackPage />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Join the campaign' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await userEvent.click(screen.getByRole('tab', { name: 'Impact' }));

    // Welcome gift is surfaced, and the ladder runs to 20 levels.
    expect(screen.getByText('$10 to your causes, on us')).toBeInTheDocument();
    expect(screen.getByText(/Level 3 of 20/)).toBeInTheDocument();

    // Far-off levels are hidden until the visitor expands the journey.
    expect(screen.queryByText(/Legend\s+·/)).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: /Show \d+ more levels/ }),
    );
    expect(screen.getByText(/Legend\s+·/)).toBeInTheDocument();
  });
});

describe('GivebackLeaderboard', () => {
  const renderLeaderboard = (setActiveTab = jest.fn()) => {
    render(
      <GivebackProvider>
        <GivebackNavProvider
          hasStarted
          start={jest.fn()}
          activeTab="impact"
          setActiveTab={setActiveTab}
        >
          <GivebackLeaderboard />
        </GivebackNavProvider>
      </GivebackProvider>,
    );
  };

  it('ranks contributors and shows the viewer row', () => {
    renderLeaderboard();

    expect(screen.getByText('Weekly leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Ana Pereira')).toBeInTheDocument();
    expect(screen.getByText('Your rank')).toBeInTheDocument();
    expect(screen.getByText(/more to pass/)).toBeInTheDocument();
    expect(screen.getAllByText('Yuki Tanaka').length).toBeGreaterThan(0);
  });

  it('sends the viewer to the actions tab from the climb CTA', async () => {
    const setActiveTab = jest.fn();
    renderLeaderboard(setActiveTab);

    await userEvent.click(screen.getByRole('button', { name: 'Take action' }));

    expect(setActiveTab).toHaveBeenCalledWith('actions');
  });
});

describe('ActionCatalog', () => {
  it('renders actions without per-user status text', () => {
    render(
      <GivebackProvider>
        <GivebackNavProvider
          hasStarted
          start={jest.fn()}
          activeTab="actions"
          setActiveTab={jest.fn()}
        >
          <ActionCatalog />
        </GivebackNavProvider>
      </GivebackProvider>,
    );

    expect(
      screen.getByText('Share the Giveback launch post'),
    ).toBeInTheDocument();
    // Per-user status copy was removed in favor of community engagement.
    expect(screen.queryByText(/Counted toward goal/)).not.toBeInTheDocument();
  });

  it('promotes the leaderboard and surfaces per-card details', async () => {
    const setActiveTab = jest.fn();
    render(
      <GivebackProvider>
        <GivebackNavProvider
          hasStarted
          start={jest.fn()}
          activeTab="actions"
          setActiveTab={setActiveTab}
        >
          <ActionCatalog />
        </GivebackNavProvider>
      </GivebackProvider>,
    );

    // The top-contributor spotlight is replaced by a promo that drives people
    // to the leaderboard (which now lives on the Impact tab).
    expect(
      screen.getByText(/developers contributed this week/),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: /See leaderboard/ }),
    );
    expect(setActiveTab).toHaveBeenCalledWith('impact');

    // The card keeps a single explicit title plus the supporting details:
    // social proof and the "Popular" badge.
    expect(
      screen.getByText('Share the Giveback launch post'),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/contributed/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Popular').length).toBeGreaterThan(0);
  });

  it('filters actions by category', async () => {
    render(
      <GivebackProvider>
        <GivebackNavProvider
          hasStarted
          start={jest.fn()}
          activeTab="actions"
          setActiveTab={jest.fn()}
        >
          <ActionCatalog />
        </GivebackNavProvider>
      </GivebackProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Referrals' }));

    // Expand so the assertion covers every referral action, not just page one.
    const showMore = screen.queryByRole('button', {
      name: /Show more actions/,
    });
    if (showMore) {
      await userEvent.click(showMore);
    }

    expect(screen.getByText('Invite a developer friend')).toBeInTheDocument();
    expect(screen.getByText('Refer a dev team')).toBeInTheDocument();
    expect(
      screen.queryByText('Share the Giveback launch post'),
    ).not.toBeInTheDocument();
  });

  it('sorts actions with the sort control', async () => {
    render(
      <GivebackProvider>
        <GivebackNavProvider
          hasStarted
          start={jest.fn()}
          activeTab="actions"
          setActiveTab={jest.fn()}
        >
          <ActionCatalog />
        </GivebackNavProvider>
      </GivebackProvider>,
    );

    await userEvent.selectOptions(
      screen.getByLabelText('Sort actions'),
      'value-desc',
    );

    // Expand the grid so the assertion isn't limited to the first page.
    await userEvent.click(
      screen.getByRole('button', { name: /Show more actions/ }),
    );

    expect(screen.getByText('Refer a dev team')).toBeInTheDocument();
  });

  it('submits eligible action proof as pending validation', async () => {
    render(
      <GivebackProvider>
        <GivebackNavProvider
          hasStarted
          start={jest.fn()}
          activeTab="actions"
          setActiveTab={jest.fn()}
        >
          <ActionCatalog />
        </GivebackNavProvider>
      </GivebackProvider>,
    );

    expect(screen.getByText('Your contribution')).toBeInTheDocument();
    expect(screen.getByText('$110')).toBeInTheDocument();

    // The catalog opens to a short list; expand it to reach this action.
    await userEvent.click(
      screen.getByRole('button', { name: /Show more actions/ }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Submit proof for Refer a dev team' }),
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText('Refer a dev team')).toHaveLength(2);

    await userEvent.type(
      screen.getByPlaceholderText(
        'Add any context that helps us validate this.',
      ),
      'Introduced daily.dev to the platform team.',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Submit for review' }),
    );

    expect(screen.getByText('Proof submitted')).toBeInTheDocument();
    expect(screen.getByText('You helped unlock $40')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Added to your contribution. We'll only subtract it if validation fails.",
      ),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(screen.getByText('$150')).toBeInTheDocument();
  });

  it('fires the win-moment celebration when an action is submitted', async () => {
    render(
      <GivebackProvider>
        <GivebackNavProvider
          hasStarted
          start={jest.fn()}
          activeTab="actions"
          setActiveTab={jest.fn()}
        >
          <ActionCatalog />
          <GivebackCelebration />
        </GivebackNavProvider>
      </GivebackProvider>,
    );

    expect(screen.queryByText('added to the pot')).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /Show more actions/ }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Submit proof for Refer a dev team' }),
    );
    await userEvent.type(
      screen.getByPlaceholderText(
        'Add any context that helps us validate this.',
      ),
      'Introduced daily.dev to the platform team.',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Submit for review' }),
    );

    expect(screen.getByText('added to the pot')).toBeInTheDocument();
    expect(
      screen.getByText('You unlocked $40 for your causes.'),
    ).toBeInTheDocument();
  });
});

describe('CauseSelection', () => {
  const renderCauseSelection = () =>
    render(
      <GivebackProvider>
        <CauseSelection onContinue={() => {}} />
      </GivebackProvider>,
    );

  it('selects causes from the grid and suggests new ones', async () => {
    renderCauseSelection();

    // Python Software Foundation is selected by default in the card grid.
    expect(
      screen.getByRole('button', { name: /Python Software Foundation/ }),
    ).toHaveAttribute('aria-pressed', 'true');

    // Toggle another recommended cause directly from the grid.
    await userEvent.click(screen.getByRole('button', { name: /freeCodeCamp/ }));
    expect(
      screen.getByRole('button', { name: /freeCodeCamp/ }),
    ).toHaveAttribute('aria-pressed', 'true');

    // Suggesting a cause happens in a focused modal.
    await userEvent.click(
      screen.getByRole('button', { name: 'Suggest a cause' }),
    );
    await userEvent.type(
      screen.getByLabelText('Cause name'),
      'OpenJS Foundation',
    );
    await userEvent.type(
      screen.getByLabelText('Website'),
      'https://openjsf.org',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Suggest cause' }),
    );

    expect(screen.getByText('OpenJS Foundation')).toBeInTheDocument();
    expect(screen.getByText('pending review')).toBeInTheDocument();
  });

  it('filters causes by category', async () => {
    renderCauseSelection();

    // The "Recommended" filter is active by default, so non-recommended causes
    // (e.g. GiveWell Top Charities Fund) stay hidden.
    expect(screen.getByRole('button', { name: 'Recommended' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      screen.queryByRole('button', { name: /GiveWell Top Charities Fund/ }),
    ).not.toBeInTheDocument();

    // Switching to its category reveals it.
    await userEvent.click(screen.getByRole('button', { name: 'Global good' }));

    expect(
      screen.getByRole('button', { name: /GiveWell Top Charities Fund/ }),
    ).toBeInTheDocument();
  });
});

describe('Love actions in the catalog', () => {
  it('shows love actions with appreciation messaging and no submission CTA', () => {
    render(
      <GivebackProvider>
        <GivebackNavProvider
          hasStarted
          start={jest.fn()}
          activeTab="actions"
          setActiveTab={jest.fn()}
        >
          <ActionCatalog />
        </GivebackNavProvider>
      </GivebackProvider>,
    );

    expect(
      screen.getByText('Leave an honest mobile app review'),
    ).toBeInTheDocument();
    expect(screen.getByText(/genuinely\s+appreciate them/)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'Submit proof for Leave an honest mobile app review',
      }),
    ).not.toBeInTheDocument();
  });

  it('opens a compliant appreciation view when a love action is clicked', async () => {
    render(
      <GivebackProvider>
        <GivebackNavProvider
          hasStarted
          start={jest.fn()}
          activeTab="actions"
          setActiveTab={jest.fn()}
        >
          <ActionCatalog />
        </GivebackNavProvider>
      </GivebackProvider>,
    );

    // Love cards are clickable, but route to an appreciation view with no
    // reward/proof flow (they can't be incentivized).
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Show some love: Leave an honest mobile app review',
      }),
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Show some love')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Submit for review' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Got it' })).toBeInTheDocument();
  });
});

describe('CommunityImpactSection', () => {
  it('renders the human-outcome impact grid', () => {
    render(
      <GivebackProvider>
        <CommunityImpactSection />
      </GivebackProvider>,
    );

    expect(screen.getByText('What your work turns into')).toBeInTheDocument();
    expect(screen.getByText('3,200 learners')).toBeInTheDocument();
    expect(screen.getByText('freeCodeCamp')).toBeInTheDocument();
  });

  it('renders anonymized live community activity', () => {
    render(
      <GivebackProvider>
        <GivebackCommunityActivity />
      </GivebackProvider>,
    );

    expect(
      screen.getByText(/shared the Giveback launch post/),
    ).toBeInTheDocument();
    expect(screen.getByText('Live community activity')).toBeInTheDocument();
  });

  it('lets a visitor add a sponsorship from the funding progress', async () => {
    render(<GivebackPage />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Join the campaign' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await userEvent.click(screen.getByRole('tab', { name: 'Impact' }));

    // Sponsors live on the funding meter now — there is no separate tab.
    expect(
      screen.queryByRole('tab', { name: 'Sponsors' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Sponsors topping up the pot')).toBeInTheDocument();
    expect(screen.getByText(/10 sponsors/)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Become a sponsor' }),
    );

    await userEvent.type(screen.getByLabelText('Company name'), 'Globex Corp');
    await userEvent.click(screen.getByRole('button', { name: '$5,000' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add $5,000' }));

    // The modal closes and the new sponsorship lands in the count.
    expect(screen.queryByLabelText('Company name')).not.toBeInTheDocument();
    expect(screen.getByText(/11 sponsors/)).toBeInTheDocument();
  });
});

describe('GivebackReviewToggle', () => {
  it('updates the community goal progress when a preset is selected', async () => {
    render(
      <GivebackProvider>
        <GivebackNavProvider
          hasStarted
          start={() => undefined}
          activeTab="impact"
          setActiveTab={() => undefined}
        >
          <CommunityGoalProgress />
        </GivebackNavProvider>
        <GeoGateFallback />
        <CommunityImpactSection />
        <GivebackReviewToggle />
      </GivebackProvider>,
    );

    expect(screen.getByText('50% funded')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '100%' }));

    expect(screen.getByText('100% funded')).toBeInTheDocument();
  });

  it('simulates geo and feed states from the QA panel', async () => {
    render(
      <GivebackProvider>
        <GeoGateFallback />
        <GivebackCommunityActivity />
        <GivebackReviewToggle />
      </GivebackProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Hide feed' }));
    expect(screen.getByText('Community feed hidden')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'waitlist' }));
    expect(
      screen.getByText('Giveback is not available in your country yet'),
    ).toBeInTheDocument();
  });
});
