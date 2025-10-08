import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { apiUrl } from '../lib/config';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useAuthContext } from '../contexts/AuthContext';

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

const useGif = ({ query, limit = '10' }: { query: string; limit?: string }) => {
  const { user } = useAuthContext();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<GifResponse>({
      queryKey: generateQueryKey(RequestKey.Gif, user, {
        query,
        limit,
      }),
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
  const { data: favData } = useQuery({
    queryKey: generateQueryKey(RequestKey.Gif, user, 'favorites'),
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/gifs/favorites`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch favorite gifs');
      }
      return response.json();
    },
  });

  const { mutate } = useMutation({
    mutationKey: generateQueryKey(RequestKey.Gif, user, 'favorites'),
    mutationFn: async (gif: GifData) => {
      const response = await fetch(`${apiUrl}/gifs/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(gif),
      });
      if (!response.ok) {
        throw new Error('Failed to favorite gif');
      }
      return response.json();
    },
  });

  return {
    data: gifs,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    favorite: mutate,
    favorites: favData?.favorites || [],
  };
};

export default useGif;
