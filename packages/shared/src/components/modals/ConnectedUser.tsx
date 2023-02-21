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
      <div className="flex w-full flex-1 flex-col items-center px-10 pt-8">
        <ImageInput viewOnly initialValue={user.image} size="large" />
        <span className="mt-5 typo-title3">{user.email}</span>
        <span className="mt-1 text-theme-label-tertiary typo-footnote">
          Connected log in methods:{' '}
          {data?.result?.map((method) => capitalize(method)).join(', ')}
        </span>
        <p className="mt-12 text-center text-theme-label-secondary typo-body">
          You previously logged in to daily.dev. If you want to add{' '}
          {capitalize(user.provider)} as another login option, you will need to
          login again.
        </p>
      </div>
      <span className="mt-auto flex w-full flex-row justify-center border-t border-theme-divider-tertiary p-3">
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
