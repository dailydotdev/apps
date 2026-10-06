import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import type { SquadJob, SquadJobInput } from '../../../graphql/squadJobsPerks';
import {
  addSquadJob,
  removeSquadJob,
  reorderSquadJobs,
  squadJobsQueryOptions,
  updateSquadJob,
} from '../../../graphql/squadJobsPerks';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { getSquadMutationErrorMessage } from './useSquadPerks';
import { getSquadId, hasSquadFeature } from '../lib/features';

export const useSquadJobs = (squad: Squad) => {
  const { data, isPending } = useQuery(squadJobsQueryOptions({ squad }));

  return {
    isEnabled: hasSquadFeature(squad, 'jobs'),
    jobs: data ?? [],
    isPending,
  };
};

export const useSquadJobMutations = (squad: Squad) => {
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const { queryKey } = squadJobsQueryOptions({ squad });
  const setJobs = (update: (jobs: SquadJob[]) => SquadJob[]) =>
    client.setQueryData<SquadJob[]>(queryKey, (jobs) => update(jobs ?? []));
  const onError = (error: unknown) =>
    displayToast(getSquadMutationErrorMessage(error));

  const { mutateAsync: onAdd } = useMutation({
    mutationFn: (input: SquadJobInput) =>
      addSquadJob({ sourceId: getSquadId(squad), input }),
    onSuccess: (job) => {
      setJobs((jobs) => [job, ...jobs]);
      displayToast('The role has been added');
    },
    onError,
  });

  const { mutateAsync: onUpdate } = useMutation({
    mutationFn: updateSquadJob,
    onSuccess: (job) => {
      setJobs((jobs) => jobs.map((item) => (item.id === job.id ? job : item)));
      displayToast('The role has been updated');
    },
    onError,
  });

  const { mutateAsync: onRemove, isPending: isRemoving } = useMutation({
    mutationFn: removeSquadJob,
    onSuccess: (_, id) => {
      setJobs((jobs) => jobs.filter((item) => item.id !== id));
      displayToast('The role has been removed');
    },
    onError,
  });

  const { mutate: onReorder } = useMutation({
    mutationFn: (ids: string[]) =>
      reorderSquadJobs({ sourceId: getSquadId(squad), ids }),
    onMutate: (ids) => {
      const previous = client.getQueryData<SquadJob[]>(queryKey);
      setJobs((jobs) =>
        ids
          .map((id) => jobs.find((job) => job.id === id))
          .filter((job): job is SquadJob => !!job),
      );

      return { previous };
    },
    onSuccess: (jobs) => client.setQueryData(queryKey, jobs),
    onError: (error, __, context) => {
      client.setQueryData(queryKey, context?.previous);
      onError(error);
    },
  });

  return { onAdd, onUpdate, onRemove, onReorder, isRemoving };
};
