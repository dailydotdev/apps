import { render, screen } from '@testing-library/react';
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { FollowButton } from './FollowButton';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import useShowFollowAction from '../../hooks/useShowFollowAction';
import { useIsSpecialUser } from '../../hooks/auth/useIsSpecialUser';
import { CopyType } from '../sources/SourceActions/SourceActionsFollow';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('../../hooks/contentPreference/useContentPreference', () => ({
  useContentPreference: jest.fn(),
}));

jest.mock('../../hooks/useShowFollowAction', () => jest.fn());

jest.mock('../../hooks/auth/useIsSpecialUser', () => ({
  useIsSpecialUser: jest.fn(),
}));

const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;
const mockUseContentPreference = useContentPreference as jest.MockedFunction<
  typeof useContentPreference
>;
const mockUseShowFollowAction = useShowFollowAction as jest.MockedFunction<
  typeof useShowFollowAction
>;
const mockUseIsSpecialUser = useIsSpecialUser as jest.MockedFunction<
  typeof useIsSpecialUser
>;

describe('FollowButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as ReturnType<typeof useMutation>);

    mockUseContentPreference.mockReturnValue({
      follow: jest.fn(),
      unfollow: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    } as ReturnType<typeof useContentPreference>);

    mockUseShowFollowAction.mockReturnValue({
      showActionBtn: false,
      isLoading: false,
    });

    mockUseIsSpecialUser.mockReturnValue(false);
  });

  it('renders when alwaysShow is true even if the follow action is hidden', () => {
    render(
      <FollowButton
        alwaysShow
        entityId="user-id"
        entityName="@reader"
        status={ContentPreferenceStatus.Follow}
        type={ContentPreferenceType.User}
        showSubscribe={false}
        copyType={CopyType.Custom}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: /toggle follow status, currently you are following/i,
      }),
    ).toHaveTextContent('Remove');
  });
});
