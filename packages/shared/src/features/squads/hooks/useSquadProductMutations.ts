import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import type {
  AddSquadProductParams,
  SquadProduct,
} from '../../../graphql/squadProducts';
import {
  addSquadProduct,
  removeSquadProduct,
  reorderSquadProducts,
  squadProductsQueryOptions,
  updateSquadProduct,
} from '../../../graphql/squadProducts';
import type { ApiErrorResult } from '../../../graphql/common';
import { ApiError, getApiError } from '../../../graphql/common';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { labels } from '../../../lib/labels';
import { getSquadId } from '../lib/features';

export const squadProductConflictCopy =
  'This product is already the official product of another Squad.';

export const isSquadProductConflict = (error: unknown): boolean =>
  !!getApiError(error as ApiErrorResult, ApiError.Conflict);

export const useSquadProductMutations = (squad: Squad) => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const { queryKey } = squadProductsQueryOptions({ squad, user });
  const setProducts = (update: (products: SquadProduct[]) => SquadProduct[]) =>
    client.setQueryData<SquadProduct[]>(queryKey, (products) =>
      update(products ?? []),
    );
  // The form explains a conflict next to the name instead.
  const onError = (error: ApiErrorResult) => {
    if (!isSquadProductConflict(error)) {
      displayToast(labels.error.generic);
    }
  };

  const { mutateAsync: onAdd } = useMutation({
    mutationFn: (params: Omit<AddSquadProductParams, 'sourceId'>) =>
      addSquadProduct({ ...params, sourceId: getSquadId(squad) }),
    onSuccess: (product) => {
      setProducts((products) => [...products, product]);
      displayToast('The product has been added');
    },
    onError,
  });

  const { mutateAsync: onUpdate } = useMutation({
    mutationFn: updateSquadProduct,
    onSuccess: (product) => {
      setProducts((products) =>
        products.map((item) => (item.id === product.id ? product : item)),
      );
      displayToast('The product has been updated');
    },
    onError,
  });

  const { mutateAsync: onRemove, isPending: isRemoving } = useMutation({
    mutationFn: removeSquadProduct,
    onSuccess: (_, id) => {
      setProducts((products) => products.filter((item) => item.id !== id));
      displayToast('The product has been removed');
    },
    onError,
  });

  const { mutate: onReorder } = useMutation({
    mutationFn: (ids: string[]) =>
      reorderSquadProducts({ sourceId: getSquadId(squad), ids }),
    onMutate: (ids) => {
      const previous = client.getQueryData<SquadProduct[]>(queryKey);
      setProducts((products) =>
        ids
          .map((id) => products.find((product) => product.id === id))
          .filter((product): product is SquadProduct => !!product),
      );

      return { previous };
    },
    onSuccess: (products) => client.setQueryData(queryKey, products),
    onError: (error: ApiErrorResult, _, context) => {
      client.setQueryData(queryKey, context?.previous);
      onError(error);
    },
  });

  return { onAdd, onUpdate, onRemove, onReorder, isRemoving };
};
