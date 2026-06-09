import { act, renderHook, waitFor } from '@testing-library/react';
import { useGivebackCauseSelection } from './useGivebackCauseSelection';
import { useContributionCauses } from './useContributionCauses';
import { useContributionCausePreferences } from './useContributionCausePreferences';
import { useUpdateContributionCausePreferences } from './useUpdateContributionCausePreferences';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { labels } from '../../../lib/labels';

jest.mock('./useContributionCauses');
jest.mock('./useContributionCausePreferences');
jest.mock('./useUpdateContributionCausePreferences');
jest.mock('../../../hooks/useToastNotification');

const mockUseCauses = useContributionCauses as jest.MockedFunction<
  typeof useContributionCauses
>;
const mockUsePreferences =
  useContributionCausePreferences as jest.MockedFunction<
    typeof useContributionCausePreferences
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

beforeEach(() => {
  jest.clearAllMocks();
  mockUseCauses.mockReturnValue({ causes: [], isPending: false });
  mockUseUpdate.mockReturnValue({ saveCausePreferences, isPending: false });
  mockUseToast.mockReturnValue({ displayToast } as unknown as ReturnType<
    typeof useToastNotification
  >);
  mockUsePreferences.mockReturnValue({
    selectedCauseIds: [],
    isPending: false,
  });
});

it('seeds the selection from saved preferences', () => {
  mockUsePreferences.mockReturnValue({
    selectedCauseIds: ['c1', 'c2'],
    isPending: false,
  });

  const { result } = renderHook(() => useGivebackCauseSelection(true));

  expect(result.current.selectedCount).toBe(2);
  expect(result.current.selectedIds.has('c1')).toBe(true);
});

it('does not seed an empty selection while disabled, then seeds once enabled', () => {
  // Gated off: the preferences query reports not-loading with no data.
  mockUsePreferences.mockReturnValue({
    selectedCauseIds: [],
    isPending: false,
  });

  const { result, rerender } = renderHook(
    ({ enabled }) => useGivebackCauseSelection(enabled),
    { initialProps: { enabled: false } },
  );

  expect(result.current.selectedCount).toBe(0);

  // Visitor opts in: the real preferences resolve and must seed the picker.
  mockUsePreferences.mockReturnValue({
    selectedCauseIds: ['c1', 'c2'],
    isPending: false,
  });
  rerender({ enabled: true });

  expect(result.current.selectedCount).toBe(2);
  expect(result.current.selectedIds.has('c1')).toBe(true);
});

it('toggles a cause on and off', () => {
  const { result } = renderHook(() => useGivebackCauseSelection(true));

  act(() => result.current.toggleCause('c1'));
  expect(result.current.selectedIds.has('c1')).toBe(true);

  act(() => result.current.toggleCause('c1'));
  expect(result.current.selectedIds.has('c1')).toBe(false);
});

it('saves the current selection and toasts', async () => {
  const { result } = renderHook(() => useGivebackCauseSelection(true));

  act(() => result.current.toggleCause('c1'));
  await act(async () => {
    await result.current.save();
  });

  await waitFor(() =>
    expect(saveCausePreferences).toHaveBeenCalledWith(['c1']),
  );
  expect(displayToast).toHaveBeenCalledWith('Your causes are saved');
});

it('toasts a generic error when saving fails', async () => {
  saveCausePreferences.mockRejectedValueOnce(new Error('network'));
  const { result } = renderHook(() => useGivebackCauseSelection(true));

  await act(async () => {
    await result.current.save();
  });

  expect(displayToast).toHaveBeenCalledWith(labels.error.generic);
});
