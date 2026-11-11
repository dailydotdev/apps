import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import { SourcePermissions } from '../../../graphql/sources';
import { ButtonSize } from '../../../components/buttons/Button';
import { SquadRulesEditButton } from './SquadRulesEditButton';

const squad = {
  handle: 'devs',
  currentMember: { permissions: [SourcePermissions.Edit] },
} as unknown as Squad;

// Tooltip's trigger props land on its direct child. Link (next/link in
// legacyBehavior) drops them, so with Link there the tooltip never opens;
// TooltipLinkWrapper sits between them.
const renderButton = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SquadRulesEditButton squad={squad} size={ButtonSize.Small} />
    </QueryClientProvider>,
  );

describe('SquadRulesEditButton', () => {
  it('opens its tooltip when the link takes focus', async () => {
    renderButton();

    await userEvent.tab();

    expect(screen.getByRole('link', { name: 'Edit rules' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Edit rules');
    // The wrapper takes the trigger props but not the Tooltip's aria-label
    expect(screen.getAllByLabelText('Edit rules')).toHaveLength(1);
  });

  it('does not keep focus on the link after a mouse click', async () => {
    renderButton();
    const link = screen.getByRole('link', { name: 'Edit rules' });
    link.addEventListener('click', (event) => event.preventDefault());

    await userEvent.click(link);

    expect(link).not.toHaveFocus();
  });
});
