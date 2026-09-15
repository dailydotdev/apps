import { renderHook } from '@testing-library/react';
import type { StatuslineItem } from '../../../graphql/statusline';
import { useSponsorStrip } from './useSponsorStrip';
import { useSponsorStripFeed } from './useSponsorStripFeed';
import { useStripHeadlines } from './useStripHeadlines';

jest.mock('./useSponsorStrip', () => ({ useSponsorStrip: jest.fn() }));
jest.mock('./useStripHeadlines', () => ({ useStripHeadlines: jest.fn() }));

const mockStrip = jest.mocked(useSponsorStrip);
const mockHeadlines = jest.mocked(useStripHeadlines);

const headline = { id: 'h1' } as StatuslineItem;

const settled = (headlines: StatuslineItem[]) => ({
  headlines,
  isSettled: true,
});

const render = () =>
  renderHook(() => useSponsorStripFeed({ feedName: 'my-feed' }));

beforeEach(() => {
  jest.clearAllMocks();
  mockStrip.mockReturnValue(true);
  mockHeadlines.mockReturnValue(settled([headline]));
});

it('should not query headlines when the strip is off', () => {
  mockStrip.mockReturnValue(false);
  render();

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
