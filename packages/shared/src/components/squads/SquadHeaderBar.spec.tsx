import { QueryClient } from '@tanstack/react-query';
import { render, RenderResult, screen } from '@testing-library/react';
import React from 'react';
import { SquadHeaderBar } from './SquadHeaderBar';

import {
  generateMembersList,
  generateTestSquad,
} from '../../../__tests__/fixture/squads';
import { TestBootProvider } from '../../../__tests__/helpers/boot';

const client = new QueryClient();
const mock = {
  squad: generateTestSquad(),
  members: generateMembersList().map((member) => member.node),
} as const;

const renderComponent = (options?: {
  props?: Partial<typeof mock>;
}): RenderResult => {
  const { props = {} } = options ?? {};

  return render(
    <TestBootProvider client={client}>
      <SquadHeaderBar
        members={props.members ?? mock.members}
        squad={props.squad ?? mock.squad}
      />
    </TestBootProvider>,
  );
};

describe('Member list', () => {
  it('should render the squad header bar with the correct number of members', async () => {
    renderComponent();
    const { membersCount } = mock.squad;
    const countEl = await screen.findByLabelText(
      `View ${membersCount} squad members`,
    );
    expect(countEl).toHaveTextContent(membersCount.toString());
  });
});

describe('Moderation button', () => {
  it('should not render button with pending posts moderation is disabled', async () => {
    const squad = generateTestSquad({
      moderationRequired: false,
      moderationPostCount: 10,
    });
    renderComponent({ props: { squad } });
    const buttonEl = screen.queryByTestId('squad-moderation-button');
    expect(buttonEl).not.toBeInTheDocument();
  });

  it('should not render button with pending posts if none', async () => {
    const squad = generateTestSquad({
      moderationRequired: true,
      moderationPostCount: 0,
    });
    renderComponent({ props: { squad } });
    const buttonEl = screen.queryByTestId('squad-moderation-button');
    expect(buttonEl).not.toBeInTheDocument();
  });

  it('should render button with pending posts if any', async () => {
    const squad = generateTestSquad({
      moderationRequired: true,
      moderationPostCount: 1,
    });
    renderComponent({ props: { squad } });
    await screen.findByText('1 Pending post');
  });
});
