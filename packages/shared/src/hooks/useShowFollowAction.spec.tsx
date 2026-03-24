import { renderHook } from '@testing-library/react';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../graphql/contentPreference';
import { useContentPreferenceStatusQuery } from './contentPreference/useContentPreferenceStatusQuery';
import useShowFollowAction from './useShowFollowAction';

jest.mock('./contentPreference/useContentPreferenceStatusQuery', () => ({
  useContentPreferenceStatusQuery: jest.fn(),
}));

const mockUseContentPreferenceStatusQuery =
  useContentPreferenceStatusQuery as jest.MockedFunction<
    typeof useContentPreferenceStatusQuery
  >;

describe('useShowFollowAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show the action again when the follow status is cleared later', () => {
    mockUseContentPreferenceStatusQuery.mockReturnValue({
      data: {
        status: ContentPreferenceStatus.Follow,
      },
      isSuccess: true,
      isLoading: false,
    } as ReturnType<typeof useContentPreferenceStatusQuery>);

    const { result, rerender } = renderHook(
      (props: { status: ContentPreferenceStatus | null }) => {
        mockUseContentPreferenceStatusQuery.mockReturnValue({
          data: props.status
            ? {
                status: props.status,
              }
            : null,
          isSuccess: true,
          isLoading: false,
        } as ReturnType<typeof useContentPreferenceStatusQuery>);

        return useShowFollowAction({
          entityId: 'squad-id',
          entityType: ContentPreferenceType.Source,
        });
      },
      {
        initialProps: {
          status: ContentPreferenceStatus.Follow as ContentPreferenceStatus | null,
        },
      },
    );

    expect(result.current.showActionBtn).toBe(false);

    rerender({ status: null });

    expect(result.current.showActionBtn).toBe(true);
  });
});
