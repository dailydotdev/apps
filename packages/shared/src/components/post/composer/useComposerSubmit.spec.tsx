import { renderHook, act } from '@testing-library/react';
import type { FormEvent } from 'react';
import { usePostToSquad } from '../../../hooks';
import type { Squad } from '../../../graphql/sources';
import { DEFAULT_LINK, DEFAULT_POLL, DEFAULT_TEXT } from './types';
import { useComposerSubmit } from './useComposerSubmit';

const mockOnUpdateSharePost = jest.fn();
const mockOnSubmitPost = jest.fn();
const mockDisplayToast = jest.fn();

jest.mock('../../../hooks', () => {
  const actual = jest.requireActual('../../../hooks');

  return {
    ...actual,
    usePostToSquad: jest.fn(),
  };
});

jest.mock('../../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'u1', username: 'me' } }),
}));

jest.mock('../../../hooks/liveRooms/useSubmitStandup', () => ({
  useSubmitStandup: () => ({ submit: jest.fn(), isPending: false }),
}));

jest.mock('../../../features/squads/hooks/useMultipleSourcePost', () => ({
  useMultipleSourcePost: () => ({ onCreate: jest.fn(), isPending: false }),
}));

const squad = { id: 'squad-1', handle: 'squad' } as Squad;

const renderSubmit = (overrides = {}) =>
  renderHook(() =>
    useComposerSubmit({
      kind: 'link',
      text: DEFAULT_TEXT,
      link: { ...DEFAULT_LINK, commentary: '  updated take  ' },
      poll: DEFAULT_POLL,
      standup: { topic: '', description: '' },
      cover: null,
      primary: squad,
      selectedIds: ['squad-1'],
      isMulti: false,
      onComplete: jest.fn(),
      editPostId: 'post-1',
      ...overrides,
    } as unknown as Parameters<typeof useComposerSubmit>[0]),
  );

describe('useComposerSubmit editing a share', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(usePostToSquad).mockReturnValue({
      getLinkPreview: jest.fn(),
      isLoadingPreview: false,
      preview: undefined,
      isPosting: false,
      onSubmitPost: mockOnSubmitPost,
      onSubmitFreeformPost: jest.fn(),
      onEditFreeformPost: jest.fn(),
      onSubmitPollPost: jest.fn(),
      onUpdateSharePost: mockOnUpdateSharePost,
    } as unknown as ReturnType<typeof usePostToSquad>);
  });

  it('updates the existing share instead of posting a new one', async () => {
    const { result } = renderSubmit();

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as FormEvent<HTMLFormElement>);
    });

    expect(mockOnUpdateSharePost).toHaveBeenCalledWith(
      expect.anything(),
      'post-1',
      'updated take',
      squad,
    );
    expect(mockOnSubmitPost).not.toHaveBeenCalled();
  });

  it('stays submittable without a resolved preview', () => {
    // The link is fixed while editing, so there is no URL/preview pair to
    // validate — requiring one left the Post button permanently disabled.
    const { result } = renderSubmit();

    expect(result.current.isSubmitDisabled).toBe(false);
  });

  it('still requires a valid preview when creating', () => {
    const { result } = renderSubmit({ editPostId: undefined });

    expect(result.current.isSubmitDisabled).toBe(true);
  });
});
