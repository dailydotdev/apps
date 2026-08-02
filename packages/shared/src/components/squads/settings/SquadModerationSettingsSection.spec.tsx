import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SquadModerationSettingsSection } from './SquadModerationSettingsSection';
import { SourceMemberRole } from '../../../graphql/sources';

const renderComponent = (
  props: Partial<
    React.ComponentProps<typeof SquadModerationSettingsSection>
  > = {},
) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SquadModerationSettingsSection
        initialMemberPostingRole={SourceMemberRole.Member}
        {...props}
      />
    </QueryClientProvider>,
  );

const getGate = (label: string) =>
  screen.getByLabelText(label) as HTMLInputElement;

describe('SquadModerationSettingsSection', () => {
  it('spells out whether each gate reviews posts', () => {
    renderComponent();

    expect(screen.getByText('All members can post. No review.')).toBeVisible();
    expect(
      screen.getByText('All members can post. Every post is reviewed.'),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Only members with enough reputation can post. No review.',
      ),
    ).toBeVisible();
  });

  it('says posts skip review under the reputation gate', () => {
    renderComponent({ initialPostingMinReputation: 100 });

    expect(
      screen.getByText(
        'Members below this reputation cannot post at all. Everyone else posts without review.',
      ),
    ).toBeVisible();
  });

  it('selects the open gate when nothing is configured', () => {
    renderComponent();

    expect(getGate('Anyone can post').checked).toBe(true);
    expect(
      screen.queryByLabelText('Minimum reputation'),
    ).not.toBeInTheDocument();
  });

  it('selects the moderation gate when moderation is required', () => {
    renderComponent({ initialModerationRequired: true });

    expect(getGate('Require post approval').checked).toBe(true);
    expect(
      screen.queryByLabelText('Minimum reputation'),
    ).not.toBeInTheDocument();
  });

  it('selects the reputation gate and shows the configured threshold', () => {
    renderComponent({ initialPostingMinReputation: 500 });

    expect(getGate('Require a minimum reputation').checked).toBe(true);
    expect(
      (screen.getByLabelText('Minimum reputation') as HTMLInputElement).value,
    ).toBe('500');
  });

  it('treats a zero threshold as the reputation gate', () => {
    renderComponent({ initialPostingMinReputation: 0 });

    expect(getGate('Require a minimum reputation').checked).toBe(true);
    expect(
      (screen.getByLabelText('Minimum reputation') as HTMLInputElement).value,
    ).toBe('0');
  });

  it('reveals the threshold field when picking the reputation gate', () => {
    renderComponent();

    fireEvent.click(getGate('Require a minimum reputation'));

    expect(
      (screen.getByLabelText('Minimum reputation') as HTMLInputElement).value,
    ).toBe('250');
  });

  it('drops back to the open gate when only moderators may post', () => {
    renderComponent({ initialPostingMinReputation: 500 });

    // "Only moderators" labels both the posting-role and invite-role radios;
    // the posting-role one renders first.
    fireEvent.click(screen.getAllByLabelText('Only moderators')[0]);

    expect(getGate('Anyone can post').checked).toBe(true);
    expect(getGate('Require a minimum reputation').disabled).toBe(true);
    expect(
      screen.queryByLabelText('Minimum reputation'),
    ).not.toBeInTheDocument();
  });
});
