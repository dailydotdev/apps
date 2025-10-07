import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '../lib/config';

const useGifQuery = ({ query, limit }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['gifQuery', query, limit],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/gifs?q=${query}&limit=${limit}`);
      return response.json();
    },
    enabled: !!query,
  });

  return {
    data,
    isLoading,
  };
};

export default useGifQuery;
