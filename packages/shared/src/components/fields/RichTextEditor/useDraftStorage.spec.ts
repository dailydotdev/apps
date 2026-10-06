import { act, renderHook } from '@testing-library/react';
import { useDraftStorage } from './useDraftStorage';

const draftKey = (id: string) => `dailydev:comment:draft:${id}`;

describe('useDraftStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('saves a pending draft when the composer unmounts', () => {
    const { rerender, unmount } = renderHook(useDraftStorage, {
      initialProps: { postId: 'p1', content: '', isDirty: false },
    });

    rerender({ postId: 'p1', content: 'unsaved thought', isDirty: true });
    unmount();

    expect(localStorage.getItem(draftKey('p1'))).toBe('unsaved thought');
  });

  it('does not restore a draft after it was cleared', () => {
    const { result, rerender, unmount } = renderHook(useDraftStorage, {
      initialProps: { postId: 'p1', content: '', isDirty: false },
    });

    rerender({ postId: 'p1', content: 'posted', isDirty: true });
    act(() => {
      result.current.clearDraft();
    });
    unmount();

    expect(localStorage.getItem(draftKey('p1'))).toBeNull();
  });
});
