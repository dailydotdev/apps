import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GivebackPage } from './GivebackPage';
import { GivebackProvider } from '../GivebackContext';
import { GivebackNavProvider } from '../GivebackNavContext';
import { CommunityGoalProgress } from './CommunityGoalProgress';
import { GivebackReviewToggle } from './GivebackReviewToggle';
import { ActionCatalog } from './ActionCatalog';
import { CauseSelection } from './CauseSelection';
import { CommunityImpactSection } from './CommunityImpactSection';
import { GeoGateFallback } from './GeoGateFallback';

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

    // Lands on the cause picker first.
    expect(
      screen.getByText('Pick the causes you care about'),
    ).toBeInTheDocument();

    // Continue moves on to the community Impact view.
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText("We're funding this together")).toBeInTheDocument();
    expect(screen.getByText(/You give back, we give back/)).toBeInTheDocument();
    expect(screen.getByText('Your road to Legend')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Why' }));
    expect(
      screen.getByText("We'd rather fund you than ads"),
    ).toBeInTheDocument();
    expect(screen.getByText('What we unlock together')).toBeInTheDocument();
    expect(screen.getByText('Community impact')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Take action' }));
    expect(
      screen.getByRole('heading', { name: 'Take action' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/genuinely\s+appreciate them/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Updates' }));
    expect(screen.getByText('We just crossed 50% funded')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Comments' }));
    expect(
      screen.getByRole('button', { name: 'Post comment' }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'FAQ' }));
    expect(screen.getByText('Does this cost me anything?')).toBeInTheDocument();
  });

  it('lets a visitor post a comment', async () => {
    render(<GivebackPage />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Join the campaign' }),
    );
    await userEvent.click(screen.getByRole('tab', { name: 'Comments' }));

    await userEvent.type(
      screen.getByLabelText('Add a comment'),
      'Backing this for open source!',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Post comment' }));

    expect(
      screen.getByText('Backing this for open source!'),
    ).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('shows the mocked goal progress at 50% after opting in', async () => {
    render(<GivebackPage />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Join the campaign' }),
    );
    await userEvent.click(screen.getByRole('tab', { name: 'Impact' }));

    expect(screen.getAllByText('$5,000')[0]).toBeInTheDocument();
    expect(screen.getAllByText('$10,000')[0]).toBeInTheDocument();
    expect(screen.getByText('50% funded')).toBeInTheDocument();
  });
});

describe('ActionCatalog', () => {
  it('renders action statuses', () => {
    render(
      <GivebackProvider>
        <ActionCatalog />
      </GivebackProvider>,
    );

    expect(
      screen.getByText('Share the Giveback launch post'),
    ).toBeInTheDocument();
    expect(screen.getByText('Counted toward goal')).toBeInTheDocument();
  });

  it('filters actions by category', async () => {
    render(
      <GivebackProvider>
        <ActionCatalog />
      </GivebackProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Referrals' }));

    expect(screen.getByText('Invite a developer friend')).toBeInTheDocument();
    expect(screen.getByText('Refer a dev team')).toBeInTheDocument();
    expect(
      screen.queryByText('Share the Giveback launch post'),
    ).not.toBeInTheDocument();
  });

  it('sorts actions with the sort control', async () => {
    render(
      <GivebackProvider>
        <ActionCatalog />
      </GivebackProvider>,
    );

    await userEvent.selectOptions(
      screen.getByLabelText('Sort actions'),
      'value-desc',
    );

    expect(screen.getByText('Refer a dev team')).toBeInTheDocument();
  });

  it('submits eligible action proof as pending validation', async () => {
    render(
      <GivebackProvider>
        <ActionCatalog />
      </GivebackProvider>,
    );

    expect(screen.getByText('Your contribution')).toBeInTheDocument();
    expect(screen.getByText('$110')).toBeInTheDocument();

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
});

describe('CauseSelection', () => {
  const renderCauseSelection = () =>
    render(
      <GivebackProvider>
        <GivebackNavProvider
          hasStarted
          start={() => {}}
          activeTab="causes"
          setActiveTab={() => {}}
        >
          <CauseSelection />
        </GivebackNavProvider>
      </GivebackProvider>,
    );

  it('selects causes from the grid and suggests new ones', async () => {
    renderCauseSelection();

    // Code.org is selected by default in the card grid.
    expect(screen.getByRole('button', { name: /Code.org/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Toggle another cause directly from the grid.
    await userEvent.click(
      screen.getByRole('button', { name: /Internet Archive/ }),
    );
    expect(
      screen.getByRole('button', { name: /Internet Archive/ }),
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
});

describe('Love actions in the catalog', () => {
  it('shows love actions with appreciation messaging and no submission CTA', () => {
    render(
      <GivebackProvider>
        <ActionCatalog />
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
});

describe('CommunityImpactSection', () => {
  it('renders anonymized community activity and transparency totals', () => {
    render(
      <GivebackProvider>
        <CommunityImpactSection />
      </GivebackProvider>,
    );

    expect(screen.getByText('Impact transparency')).toBeInTheDocument();
    expect(
      screen.getByText(/shared the Giveback launch post/),
    ).toBeInTheDocument();
    expect(screen.getByText('anonymized by default')).toBeInTheDocument();
  });
});

describe('GivebackReviewToggle', () => {
  it('updates the community goal progress when a preset is selected', async () => {
    render(
      <GivebackProvider>
        <CommunityGoalProgress />
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
        <CommunityImpactSection />
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
