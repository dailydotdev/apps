import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { mocked } from 'ts-jest/utils';
import { BriefCardDefault } from './BriefCardDefault';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useActions, useToastNotification } from '../../../../hooks';
import { useBriefContext } from '../BriefContext';
// eslint-disable-next-line import/extensions
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
// eslint-disable-next-line import/extensions
import { defaultQueryClientTestingConfig } from '../../../../../__tests__/helpers/tanstack-query';
// eslint-disable-next-line import/extensions
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { ActionType } from '../../../../graphql/actions';
import { LogEvent, TargetId, TargetType } from '../../../../lib/log';

const completeAction = jest.fn();
const checkHasCompleted = jest.fn();
const mockSetBrief = jest.fn();
const mockLogEvent = jest.fn();

jest.mock('../../../../contexts/AuthContext');
jest.mock('../../../../hooks');
jest.mock('../BriefContext');

jest.mock('../../../../graphql/common', () => ({
  gqlClient: {
    request: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

const mockUseAuthContext = mocked(useAuthContext);
const mockUseActions = mocked(useActions);
const mockUseBriefContext = mocked(useBriefContext);
const mockUseToastNotification = mocked(useToastNotification);

let client: QueryClient;

const renderComponent = () =>
  render(
    <TestBootProvider client={client} log={{ logEvent: mockLogEvent }}>
      <BriefCardDefault targetId={TargetId.Feed} title="Test title">
        <span>Test children</span>
      </BriefCardDefault>
    </TestBootProvider>,
  );

describe('BriefCardDefault', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient(defaultQueryClientTestingConfig);

    mockUseAuthContext.mockReturnValue({
      user: defaultUser,
      isLoggedIn: true,
      isAuthReady: true,
      updateUser: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    mockUseActions.mockReturnValue({
      completeAction,
      checkHasCompleted,
      isActionsFetched: true,
      actions: [],
    });

    mockUseBriefContext.mockReturnValue({
      brief: undefined,
      setBrief: mockSetBrief,
    });

    mockUseToastNotification.mockReturnValue({
      displayToast: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render the close button', () => {
    renderComponent();

    expect(screen.getByTitle('Close')).toBeInTheDocument();
  });

  it('should call completeAction with DismissBriefCard when close button is clicked', async () => {
    renderComponent();

    await userEvent.click(screen.getByTitle('Close'));

    expect(completeAction).toHaveBeenCalledWith(ActionType.DismissBriefCard);
  });

  it('should log a dismiss event when close button is clicked', async () => {
    renderComponent();

    await userEvent.click(screen.getByTitle('Close'));

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_type: TargetType.BriefCard,
      target_id: 'dismiss',
    });
  });
});
