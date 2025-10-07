import { useInfiniteQuery } from '@tanstack/react-query';
import { apiUrl } from '../lib/config';
import { RequestKey } from '../lib/query';

export type GifData = {
  id: string;
  title: string;
  preview: string;
  url: string;
};

interface GifResponse {
  gifs: GifData[];
  next?: string;
}

const useGifQuery = ({
  query,
  limit = '10',
}: {
  query: string;
  limit?: string;
}) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<GifResponse>({
      queryKey: [RequestKey.Gif, query, limit],
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams({
          q: query,
          limit: limit.toString(),
          ...(pageParam && { pos: pageParam as string }),
        });

        const response = await fetch(`${apiUrl}/gifs?${params}`);
        return response.json();
      },
      getNextPageParam: (lastPage) => {
        return lastPage.next || undefined;
      },
      initialPageParam: undefined,
      enabled: !!query,
    });

  const gifs = data?.pages.flatMap((page) => page.gifs) ?? [];

  return {
    data: gifs,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGifQuery;
