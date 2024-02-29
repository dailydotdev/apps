import React, { FormEventHandler, ReactElement, useContext } from 'react';
import { PublicProfile } from '../../lib/user';
import AuthContext from '../../contexts/AuthContext';
import { MyProfileEmptyScreen } from './MyProfileEmptyScreen';
import Markdown from '../Markdown';
import MarkdownInput from '../fields/MarkdownInput';
import { formToJson } from '../../lib/form';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { useProfileReadme } from '../../hooks/profile/useProfileReadme';

export interface ReadmeProps {
  user: PublicProfile;
}

function ReadonlyReadme({
  isSameUser,
  readme,
  onClick,
}: {
  isSameUser: boolean;
  readme?: string;
  onClick: () => unknown;
}): ReactElement {
  // Markdown is supported only in the client due to sanitization
  const isClient = typeof window !== 'undefined';

  if (!isClient) {
    return <></>;
  }

  return (
    <>
      {isSameUser && (
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={onClick}
          className="self-start"
        >
          Edit readme
        </Button>
      )}
      <Markdown content={readme} />
    </>
  );
}

function EditableReadme({
  readme,
  updateReadme,
  isLoading,
}: {
  readme: string;
  updateReadme: (content: string) => unknown;
  isLoading: boolean;
}): ReactElement {
  const onSubmitForm: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const { content } = formToJson<{ content: string }>(e.currentTarget);
    return updateReadme(content);
  };

  return (
    <form action="#" className="flex flex-col" onSubmit={onSubmitForm}>
      <MarkdownInput
        textareaProps={{
          name: 'content',
          rows: 7,
        }}
        initialContent={readme}
        enabledCommand={{ upload: true, link: true, mention: false }}
        submitCopy="Done"
        showMarkdownGuide
        onSubmit={(e) => updateReadme(e.currentTarget.value)}
        isLoading={isLoading}
      />
    </form>
  );
}

export function Readme({ user }: ReadmeProps): ReactElement {
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = loggedUser?.id === user.id;
  const readme = user?.readmeHtml;

  const {
    readme: mdReadme,
    updateReadme,
    isLoadingReadme,
    editMode,
    setEditMode,
    submitting,
  } = useProfileReadme(user);

  if (editMode) {
    return (
      <EditableReadme
        readme={mdReadme}
        updateReadme={updateReadme}
        isLoading={isLoadingReadme || submitting}
      />
    );
  }
  if (!readme && isSameUser) {
    return (
      <MyProfileEmptyScreen
        className="items-start"
        text="Do you love breaking production? Share with the world what has brought you so far"
        cta="Add readme"
        buttonProps={{ onClick: () => setEditMode(true) }}
      />
    );
  }
  return (
    <ReadonlyReadme
      isSameUser={isSameUser}
      onClick={() => setEditMode(true)}
      readme={readme}
    />
  );
}
