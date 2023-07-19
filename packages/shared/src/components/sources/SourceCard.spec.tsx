import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import { IFlags } from 'flagsmith';
import { AuthContextProvider } from '../../contexts/AuthContext';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../__tests__/fixture/squads';
import { FeaturesContextProvider } from '../../contexts/FeaturesContext';
import { SourceCard } from './SourceCard';

const onClickTest = jest.fn();
let features: IFlags;
const defaultFeatures: IFlags = {
  squad: {
    enabled: true,
  },
};

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
  features = defaultFeatures;
});

const squads = [generateTestSquad()];

const renderComponent = (hasImage = true, hasMembers = true): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <FeaturesContextProvider flags={features}>
        <AuthContextProvider
          user={loggedUser}
          updateUser={jest.fn()}
          tokenRefreshed
          getRedirectUri={jest.fn()}
          loadingUser={false}
          loadedUserFromCache
          squads={squads}
        >
          <SourceCard
            title="title"
            subtitle="subtitle"
            icon={<div>icon</div>}
            image={hasImage ? 'test-image.jpg' : undefined}
            description="description"
            action={{
              text: 'Test action',
              onClick: onClickTest,
            }}
            members={
              hasMembers
                ? {
                    edges: [
                      { node: { name: 'Member1', username: 'member1' } },
                      { node: { name: 'Member2', username: 'member2' } },
                      { node: { name: 'Member3', username: 'member3' } },
                    ],
                  }
                : undefined
            }
            membersCount={hasMembers ? 5 : undefined}
          />
        </AuthContextProvider>
      </FeaturesContextProvider>
    </QueryClientProvider>,
  );
};

// Renders the source card with all basic props
it('should render the component with basic text and an icon', async () => {
  renderComponent(false, false);

  expect(screen.getByText('title')).toBeInTheDocument();
  expect(screen.getByText('icon')).toBeInTheDocument();
});

it('should render the component with an image', () => {
  renderComponent(true, false);
  const img = screen.getByRole('img');
  const icon = screen.queryByText('icon');

  expect(img).toHaveAttribute('src', 'test-image.jpg');
  expect(icon).not.toBeInTheDocument();
});

it('should render the component and call the onClick function when the action button is clicked', () => {
  renderComponent(false, false);

  const button = screen.getByText('Test action');

  fireEvent.click(button);
  expect(onClickTest).toHaveBeenCalledTimes(1);
});

// TODO: Fix this test
// - Members array
it('should render the component and member short list when members are provided', () => {
  renderComponent(true, true);

  expect(screen.getByText('5')).toBeInTheDocument();
});

// TODO: Fix this test
// - Members array
it('should render the component and member short list when members are provided', () => {
  renderComponent(true, true);

  expect(screen.getByText('Member1')).toBeInTheDocument();
  expect(screen.getByText('Member2')).toBeInTheDocument();
  expect(screen.getByText('Member3')).toBeInTheDocument();
});

// TODO: Complete this test
it('should render the component with a join squad button', () => {
  renderComponent(true, true);
});

// TODO: Complete this test
it('should render the component with a view squad button', () => {
  renderComponent(true, true);
});
