import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PostHighlight } from '../../../graphql/highlights';
import {
  MAJOR_HEADLINES_MAX_FIRST,
  majorHeadlinesQueryOptions,
} from '../../../graphql/highlights';
import { getHighlightPostPosition } from './highlightPostModalUtils';

interface UseHighlightModalNavigationProps {
  initialHighlights: PostHighlight[];
  isOpen: boolean;
  selectedHighlightId: string | null;
}

export const useHighlightModalNavigation = ({
  initialHighlights,
  isOpen,
  selectedHighlightId,
}: UseHighlightModalNavigationProps) => {
  const { data } = useQuery({
    ...majorHeadlinesQueryOptions({ first: MAJOR_HEADLINES_MAX_FIRST }),
    enabled: isOpen,
  });
  const fetchedHighlights =
    data?.majorHeadlines.edges.map(({ node }) => node) ?? [];
  const highlights = fetchedHighlights.length
    ? fetchedHighlights
    : initialHighlights;
  const activeIndex = useMemo(() => {
    const foundIndex = highlights.findIndex(
      ({ id }) => id === selectedHighlightId,
    );

    return foundIndex >= 0 ? foundIndex : 0;
  }, [highlights, selectedHighlightId]);
  const previousHighlight =
    activeIndex > 0 ? highlights[activeIndex - 1] : undefined;
  const nextHighlight =
    activeIndex < highlights.length - 1
      ? highlights[activeIndex + 1]
      : undefined;
  const activeHighlight = highlights[activeIndex];

  return {
    activeHighlight,
    activeIndex,
    canNavigateNext: activeIndex >= 0 && activeIndex < highlights.length - 1,
    canNavigatePrevious: activeIndex > 0,
    highlights,
    nextHighlight,
    postPosition: getHighlightPostPosition(activeIndex, highlights.length),
    previousHighlight,
  };
};
