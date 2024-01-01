import React, {
  FormEventHandler,
  ReactElement,
  ReactNode,
  useContext,
  useState,
} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import request, { ClientError } from 'graphql-request';
import { PublicProfile } from '../../lib/user';
import AuthContext from '../../contexts/AuthContext';
import { MyProfileEmptyScreen } from './MyProfileEmptyScreen';
import Markdown from '../Markdown';
import MarkdownInput from '../fields/MarkdownInput';
import { UPDATE_README_MUTATION, USER_README_QUERY } from '../../graphql/users';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { graphqlUrl } from '../../lib/config';
import { useToastNotification } from '../../hooks';
import { formToJson } from '../../lib/form';
import { Button, ButtonSize, ButtonVariant } from '../buttons/ButtonV2';

export interface ReadmeProps {
  user: PublicProfile;
}

export function Readme({ user }: ReadmeProps): ReactElement {
  const { displayToast } = useToastNotification();
  const client = useQueryClient();
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = loggedUser?.id === user.id;
  const readme = user?.readmeHtml;

  // Markdown is supported only in the client due to sanitization
  const isClient = typeof window !== 'undefined';

  const [editMode, setEditMode] = useState(false);

  const queryKey = generateQueryKey(RequestKey.Readme, user);
  const { data: remoteReadme, isLoading } = useQuery<{
    user: { readme: string };
  }>(
    queryKey,
    () =>
      request(graphqlUrl, USER_README_QUERY, {
        id: user.id,
      }),
    {
      enabled: editMode,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  );

  const { mutateAsync: updateReadme, isLoading: submitting } = useMutation<
    { updateReadme: { readmeHtml: string } },
    unknown,
    string
  >((content) => request(graphqlUrl, UPDATE_README_MUTATION, { content }), {
    onSuccess: async () => {
      setEditMode(false);
      await client.invalidateQueries(queryKey);
      await client.invalidateQueries(
        generateQueryKey(RequestKey.Profile, user),
      );
    },
    onError: (err) => {
      const clientError = err as ClientError;
      const message = clientError?.response?.errors?.[0]?.message;
      if (!message) {
        return;
      }

      displayToast(message);
    },
  });

  let children: ReactNode;
  if (editMode) {
    const onSubmitForm: FormEventHandler<HTMLFormElement> = (e) => {
      e.preventDefault();
      const { content } = formToJson(e.currentTarget);
      return updateReadme(content);
    };

    children = (
      <form action="#" className="flex flex-col" onSubmit={onSubmitForm}>
        <MarkdownInput
          textareaProps={{
            name: 'content',
            rows: 7,
          }}
          initialContent={remoteReadme?.user.readme}
          enabledCommand={{ upload: true, link: true, mention: false }}
          submitCopy="Done"
          showMarkdownGuide
          onSubmit={(e) => updateReadme(e.currentTarget.value)}
          isLoading={isLoading || submitting}
        />
      </form>
    );
  } else if (!readme && isSameUser) {
    children = (
      <MyProfileEmptyScreen
        className="items-start"
        text="Do you love breaking production? Share with the world what has brought you so far"
        cta="Add readme"
        buttonProps={{ onClick: () => setEditMode(true) }}
      />
    );
  } else if (isClient) {
    children = (
      <>
        {isSameUser && (
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            onClick={() => setEditMode(true)}
            className="self-start"
          >
            Edit readme
          </Button>
        )}
        <Markdown content={readme} />
      </>
    );
  }

  return <>{children}</>;
}
