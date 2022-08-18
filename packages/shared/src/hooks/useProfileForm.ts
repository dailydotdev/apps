import { GraphQLError } from 'graphql-request/dist/types';
import request from 'graphql-request';
import { FormEvent, useContext, useState } from 'react';
import { UseMutateAsyncFunction, useMutation } from 'react-query';
import AuthContext from '../contexts/AuthContext';
import { UPDATE_USER_PROFILE_MUTATION } from '../graphql/users';
import { apiUrl } from '../lib/config';
import { LoggedUser } from '../lib/user';

interface ProfileFormHint {
  portfolio?: string;
  username?: string;
  twitter?: string;
  github?: string;
  hashnode?: string;
}

interface MutationError {
  data: unknown;
  errors: GraphQLError[];
}

interface ResponseError {
  response: MutationError;
}

type ModalEvent =
  | React.MouseEvent<Element, MouseEvent>
  | React.KeyboardEvent<Element>;

interface UseProfileForm {
  hint: ProfileFormHint;
  isLoading?: boolean;
  updateUserProfile: UseMutateAsyncFunction<
    LoggedUser,
    ResponseError,
    Partial<UpdateProfileParameters & { event: FormEvent }>
  >;
}

export interface UpdateProfileParameters {
  image?: File;
  name: string;
  username: string;
  bio: string;
  company: string;
  title: string;
  twitter: string;
  github: string;
  hashnode: string;
  portfolio: string;
  timezone: string;
  acceptedMarketing?: boolean;
}

interface UseProfileFormProps {
  onSuccess?: (e: ModalEvent) => void;
}

const useProfileForm = ({
  onSuccess,
}: UseProfileFormProps = {}): UseProfileForm => {
  const { user, updateUser } = useContext(AuthContext);
  const [hint, setHint] = useState<ProfileFormHint>({});
  const { isLoading, mutateAsync: updateUserProfile } = useMutation<
    LoggedUser,
    ResponseError,
    Partial<UpdateProfileParameters & { event: ModalEvent }>
  >(
    ({ image, event, ...data }) =>
      request(`${apiUrl}/graphql`, UPDATE_USER_PROFILE_MUTATION, {
        data,
        upload: image,
      }),
    {
      onSuccess: async (_, { image, event, ...vars }) => {
        setHint({});
        await updateUser({ ...user, ...vars });
        onSuccess?.(event);
      },
      onError: (err) => {
        if (!err?.response?.errors?.length) {
          return;
        }
        const data = JSON.parse(err.response.errors[0].message);
        setHint(data);
      },
    },
  );

  return { hint, isLoading, updateUserProfile };
};

export default useProfileForm;
