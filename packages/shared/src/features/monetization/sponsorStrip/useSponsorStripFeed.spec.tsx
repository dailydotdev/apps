import { renderHook } from '@testing-library/react';
import type { StatuslineItem } from '../../../graphql/statusline';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureSponsorStripBreakingNews } from '../../../lib/featureManagement';
import { useSponsorStrip } from './useSponsorStrip';
import { useSponsorStripFeed } from './useSponsorStripFeed';
import { useStripHeadlines } from './useStripHeadlines';

jest.mock('./useSponsorStrip', () => ({ useSponsorStrip: jest.fn() }));
jest.mock('./useStripHeadlines', () => ({ useStripHeadlines: jest.fn() }));
jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

const mockStrip = jest.mocked(useSponsorStrip);
const mockHeadlines = jest.mocked(useStripHeadlines);
const mockFeature = jest.mocked(useConditionalFeature);

const headline = { id: 'h1' } as StatuslineItem;

const settled = (headlines: StatuslineItem[]) => ({
  headlines,
  isSettled: true,
});

const render = (props: { suppressed?: boolean } = {}) =>
  renderHook(() => useSponsorStripFeed({ feedName: 'my-feed', ...props }));

beforeEach(() => {
  jest.clearAllMocks();
  mockStrip.mockReturnValue(true);
  mockHeadlines.mockReturnValue(settled([headline]));
  mockFeature.mockReturnValue({
    value: featureSponsorStripBreakingNews.defaultValue,
    isLoading: false,
  });
});

it('should hand the suppression to the strip gate', () => {
  render({ suppressed: true });

  expect(mockStrip).toHaveBeenCalledWith(
    expect.objectContaining({ suppressed: true }),
  );
});

it('should not query headlines when the strip is off', () => {
  mockStrip.mockReturnValue(false);
  render();

  expect(mockHeadlines).toHaveBeenCalledWith(false);
  expect(mockFeature).toHaveBeenCalledWith({
    feature: featureSponsorStripBreakingNews,
    shouldEvaluate: false,
  });
});

it('should evaluate breaking news only when the strip is on', () => {
  render();

  expect(mockFeature).toHaveBeenCalledWith({
    feature: featureSponsorStripBreakingNews,
    shouldEvaluate: true,
  });
  expect(mockHeadlines).toHaveBeenCalledWith(true);
});

it('should keep the sponsors and stop querying the ticker when breaking news is off', () => {
  mockFeature.mockReturnValue({ value: false, isLoading: false });
  mockHeadlines.mockReturnValue(settled([]));

  const { result } = render();

  expect(result.current.isEnabled).toBe(true);
  expect(result.current.headlines).toEqual([]);
  expect(result.current.headlinesSettled).toBe(true);
  expect(mockHeadlines).toHaveBeenCalledWith(false);
});

it('should hand the strip the same headlines it decided with', () => {
  const { result } = render();

  expect(result.current.headlines).toEqual([headline]);
  expect(result.current.isEnabled).toBe(true);
  expect(result.current.headlinesSettled).toBe(true);
});

it('should report the strip as off when the flag is off', () => {
  mockStrip.mockReturnValue(false);

  expect(render().result.current.isEnabled).toBe(false);
});

it('should report the headlines as unsettled while the query runs', () => {
  mockHeadlines.mockReturnValue({ headlines: [], isSettled: false });

  expect(render().result.current.headlinesSettled).toBe(false);
});
