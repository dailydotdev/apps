import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { removeUserExperience } from '../graphql/user/profile';
import { useToastNotification } from './useToastNotification';
import { useAuthContext } from '../contexts/AuthContext';
import { labels } from '../lib/labels';

const useRemoveExperience = () => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { user } = useAuthContext();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => removeUserExperience(id),
    onSuccess: () => {
      router.push(`/${user.id}`);
    },
    onError: () => {
      displayToast(labels.error.generic || 'Failed to delete experience');
    },
  });

  return { removeExperience: mutate, isPending };
};

export default useRemoveExperience;
