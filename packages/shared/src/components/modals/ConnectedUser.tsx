import React, { ReactElement } from 'react';
import { useQuery } from 'react-query';
import { getKratosProviders } from '../../lib/kratos';
import { capitalize } from '../../lib/strings';
import { Button } from '../buttons/Button';
import ImageInput from '../fields/ImageInput';

export interface ConnectedUser {
  name: string;
  email: string;
  image: string;
  flowId: string;
  provider: string;
}

interface ConnectedUserModalProps {
  user: ConnectedUser;
  onLogin: () => void;
}

function ConnectedUserModal({
  user,
  onLogin,
}: ConnectedUserModalProps): ReactElement {
  const { data } = useQuery(
    [{ type: 'registration', flowId: user.flowId }],
    ({ queryKey: [{ flowId }] }) => getKratosProviders(flowId),
  );

  return (
    <>
      <div className="flex flex-col flex-1 items-center px-10 pt-8 w-full">
        <ImageInput viewOnly initialValue={user.image} size="large" />
        <span className="mt-5 typo-title3">{user.email}</span>
        <span className="mt-1 typo-footnote text-theme-label-tertiary">
          Connected log in methods:{' '}
          {data?.result?.map((method) => capitalize(method)).join(', ')}
        </span>
        <p className="mt-12 text-center text-theme-label-secondary typo-body">
          You previously logged in to daily.dev. If you want to add{' '}
          {capitalize(user.provider)} as another login option, you will need to
          login again.
        </p>
      </div>
      <span className="flex flex-row justify-center p-3 mt-auto w-full border-t border-theme-divider-tertiary">
        <Button
          className="btn-primary bg-theme-color-cabbage"
          onClick={onLogin}
        >
          Log in
        </Button>
      </span>
    </>
  );
}

export default ConnectedUserModal;
