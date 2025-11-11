import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { removeUserExperience } from '../graphql/user/profile';
import { useToastNotification } from './useToastNotification';
import { labels } from '../lib/labels';
import { webappUrl } from '../lib/constants';

const useRemoveExperience = () => {
  const router = useRouter();
  const { displayToast } = useToastNotification();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => removeUserExperience(id),
    onSuccess: () => {
      const searchParams = new URLSearchParams(window.location.search);
      const type = searchParams?.get('type');
      router.push(`${webappUrl}/settings/profile/experience/${type}`);
    },
    onError: () => {
      displayToast(labels.error.generic || 'Failed to delete experience');
    },
  });

  return { removeExperience: mutate, isPending };
};

export default useRemoveExperience;
