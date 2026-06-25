import type { ReactNode } from 'react';
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGivebackCauseSelection } from './useGivebackCauseSelection';
import { useContributionCausePicker } from './useContributionCausePicker';
import { useUpdateContributionCausePreferences } from './useUpdateContributionCausePreferences';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { labels } from '../../../lib/labels';

jest.mock('./useContributionCausePicker');
jest.mock('./useUpdateContributionCausePreferences');
jest.mock('../../../hooks/useToastNotification');

const mockUsePicker = useContributionCausePicker as jest.MockedFunction<
  typeof useContributionCausePicker
>;
const mockUseUpdate =
  useUpdateContributionCausePreferences as jest.MockedFunction<
    typeof useUpdateContributionCausePreferences
  >;
const mockUseToast = useToastNotification as jest.MockedFunction<
  typeof useToastNotification
>;

const saveCausePreferences = jest.fn().mockResolvedValue(undefined);
const displayToast = jest.fn();

// The hook reads the query client (to force-clear the save toast), so renders
// need a provider.
const queryClient = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  mockUseUpdate.mockReturnValue({ saveCausePreferences, isPending: false });
  mockUseToast.mockReturnValue({ displayToast } as unknown as ReturnType<
    typeof useToastNotification
  >);
  mockUsePicker.mockReturnValue({
    causes: [],
    selectedCauseIds: [],
    isPending: false,
  });
});

it('seeds the selection from saved preferences', () => {
  mockUsePicker.mockReturnValue({
    causes: [],
    selectedCauseIds: ['c1', 'c2'],
    isPending: false,
  });

  const { result } = renderHook(() => useGivebackCauseSelection(true), {
    wrapper,
  });

  expect(result.current.selectedCount).toBe(2);
  expect(result.current.selectedIds.has('c1')).toBe(true);
  expect(result.current.hasSavedCauses).toBe(true);
});

it('reports no saved causes when the visitor has none', () => {
  const { result } = renderHook(() => useGivebackCauseSelection(true), {
    wrapper,
  });

  expect(result.current.hasSavedCauses).toBe(false);
});

it('does not seed an empty selection while disabled, then seeds once enabled', () => {
  // Gated off: the picker query reports not-loading with no data.
  mockUsePicker.mockReturnValue({
    causes: [],
    selectedCauseIds: [],
    isPending: false,
  });

  const { result, rerender } = renderHook(
    ({ enabled }) => useGivebackCauseSelection(enabled),
    { initialProps: { enabled: false }, wrapper },
  );

  expect(result.current.selectedCount).toBe(0);

  // Visitor opts in: the real preferences resolve and must seed the picker.
  mockUsePicker.mockReturnValue({
    causes: [],
    selectedCauseIds: ['c1', 'c2'],
    isPending: false,
  });
  rerender({ enabled: true });

  expect(result.current.selectedCount).toBe(2);
  expect(result.current.selectedIds.has('c1')).toBe(true);
});

it('toggles a cause on and off', () => {
  const { result } = renderHook(() => useGivebackCauseSelection(true), {
    wrapper,
  });

  act(() => result.current.toggleCause('c1'));
  expect(result.current.selectedIds.has('c1')).toBe(true);

  act(() => result.current.toggleCause('c1'));
  expect(result.current.selectedIds.has('c1')).toBe(false);
});

it('saves the current selection and toasts', async () => {
  const { result } = renderHook(() => useGivebackCauseSelection(true), {
    wrapper,
  });

  act(() => result.current.toggleCause('c1'));
  let saved: boolean | undefined;
  await act(async () => {
    saved = await result.current.save();
  });

  await waitFor(() =>
    expect(saveCausePreferences).toHaveBeenCalledWith(['c1']),
  );
  expect(displayToast).toHaveBeenCalledWith('Your causes are saved', {
    timer: 3000,
  });
  expect(saved).toBe(true);
});

it('toasts a generic error and reports failure when saving fails', async () => {
  saveCausePreferences.mockRejectedValueOnce(new Error('network'));
  const { result } = renderHook(() => useGivebackCauseSelection(true), {
    wrapper,
  });

  let saved: boolean | undefined;
  await act(async () => {
    saved = await result.current.save();
  });

  expect(displayToast).toHaveBeenCalledWith(labels.error.generic);
  expect(saved).toBe(false);
});
