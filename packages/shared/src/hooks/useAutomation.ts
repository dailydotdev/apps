import {
  MutationOptions,
  UseMutateAsyncFunction,
  useMutation,
} from '@tanstack/react-query';
import { HttpError } from '../lib/errors';

export enum Automation {
  Roaster = 'roaster',
}

export type UseAutomationRet<TData, TError, TVariables> = {
  run: UseMutateAsyncFunction<TData, TError, TVariables>;
  isLoading: boolean;
};

export function useAutomation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
>(
  name: Automation,
  options?: MutationOptions<TData, TError, TVariables>,
): UseAutomationRet<TData, TError, TVariables> {
  const { mutateAsync, isLoading } = useMutation<TData, TError, TVariables>(
    async (vars) => {
      // Vercel proxy is limited to 30 seconds 🙈
      const url = `${process.env.NEXT_PUBLIC_API_URL}/auto/${name}`;
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(vars),
        keepalive: true,
      });
      if (res.ok) {
        return res.json();
      }
      throw new HttpError(url, res.status, await res.text());
    },
    options,
  );

  return {
    run: mutateAsync,
    isLoading,
  };
}
