import { renderHook } from '@testing-library/react';
import type { PostHighlight } from '../../../graphql/highlights';
import { useSponsorStrip } from './useSponsorStrip';
import { useSponsorStripFeed } from './useSponsorStripFeed';
import { useStripHeadlines } from './useStripHeadlines';

jest.mock('./useSponsorStrip', () => ({ useSponsorStrip: jest.fn() }));
jest.mock('./useStripHeadlines', () => ({ useStripHeadlines: jest.fn() }));

const mockStrip = jest.mocked(useSponsorStrip);
const mockHeadlines = jest.mocked(useStripHeadlines);

const headline = { id: 'h1' } as PostHighlight;

const settled = (headlines: PostHighlight[]) => ({
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

it('should drop the feed card when the strip is carrying the headlines', () => {
  expect(render().result.current.disableHighlightItems).toBe(true);
});

it('should keep the feed card once the query settles with no headlines', () => {
  // An empty ticker cannot stand in for the card, and suppressing it then
  // would take breaking news out of the product altogether.
  mockHeadlines.mockReturnValue(settled([]));

  expect(render().result.current.disableHighlightItems).toBe(false);
});

// The headlines are their own round trip, landing after the feed has painted.
// Waiting for them flipped this mid-scroll and pulled the card out of the
// middle of the feed.
it('should drop the feed card before the headlines have arrived', () => {
  mockHeadlines.mockReturnValue({ headlines: [], isSettled: false });

  expect(render().result.current.disableHighlightItems).toBe(true);
});

it('should keep the feed card when the strip is off', () => {
  mockStrip.mockReturnValue(false);

  expect(render().result.current.disableHighlightItems).toBe(false);
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
