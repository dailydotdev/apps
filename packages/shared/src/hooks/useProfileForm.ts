import { GraphQLError } from 'graphql-request/dist/types';
import request from 'graphql-request';
import { FormEvent, useContext, useMemo, useState } from 'react';
import { UseMutateAsyncFunction, useMutation } from 'react-query';
import { UseMutateFunction } from 'react-query/types/react/types';
import AuthContext from '../contexts/AuthContext';
import { UPDATE_USER_PROFILE_MUTATION } from '../graphql/users';
import { apiUrl } from '../lib/config';
import { LoggedUser } from '../lib/user';

export interface ProfileFormHint {
  portfolio?: string;
  username?: string;
  twitter?: string;
  github?: string;
  hashnode?: string;
  name?: string;
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
  onUpdateHint?: (hint: Partial<ProfileFormHint>) => void;
  isLoading?: boolean;
  updateUserProfile: UseMutateFunction<
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
  const { isLoading, mutate: updateUserProfile } = useMutation<
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

  return useMemo(
    () => ({ hint, isLoading, onUpdateHint: setHint, updateUserProfile }),
    [user, hint, isLoading],
  );
};

export default useProfileForm;
