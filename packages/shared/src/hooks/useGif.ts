import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const favoritesQueryKey = generateQueryKey(RequestKey.Gif, user, 'favorites');
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
  const { data: favData, isFetching: isFetchingFavorites } =
    useQuery<GifResponse>({
      queryKey: favoritesQueryKey,
      queryFn: async () => {
        const response = await fetch(`${apiUrl}/gifs/favorites`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch favorite gifs');
        }
        return await response.json();
      },
      enabled: true,
    });
  const favorites = favData?.gifs ?? [];

  const { mutate } = useMutation<
    unknown,
    Error,
    GifData,
    { previousFavorites?: GifResponse }
  >({
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
    onMutate: async (gif) => {
      await queryClient.cancelQueries({ queryKey: favoritesQueryKey });

      const previousFavorites =
        queryClient.getQueryData<GifResponse>(favoritesQueryKey);
      const prevGifs = previousFavorites?.gifs ?? [];
      const isFavorite = prevGifs.some(({ id }) => id === gif.id);
      const updatedGifs = isFavorite
        ? prevGifs.filter(({ id }) => id !== gif.id)
        : [gif, ...prevGifs];

      queryClient.setQueryData<GifResponse>(
        favoritesQueryKey,
        (existingFavorites) => ({
          gifs: updatedGifs,
          next: existingFavorites?.next,
        }),
      );

      return { previousFavorites };
    },
    onError: (_error, _gif, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(favoritesQueryKey, context.previousFavorites);
      }
    },
  });

  return {
    data: gifs,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    favorite: mutate,
    favorites,
    isFetchingFavorites,
  };
};

export default useGif;
