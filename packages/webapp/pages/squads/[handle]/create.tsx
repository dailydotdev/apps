import React, { FormEventHandler, ReactElement } from 'react';
import { useRouter } from 'next/router';
import { useSquad } from '@dailydotdev/shared/src/hooks';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import ImageInput from '@dailydotdev/shared/src/components/fields/ImageInput';
import CameraIcon from '@dailydotdev/shared/src/components/icons/Camera';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import MarkdownInput from '@dailydotdev/shared/src/components/fields/MarkdownInput';
import { verifyPermission } from '@dailydotdev/shared/src/graphql/squads';
import { SourcePermissions } from '@dailydotdev/shared/src/graphql/sources';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import {
  WriteFreeFormSkeleton,
  WritePageContainer,
  WritePageMain,
  WritePostHeader,
} from '@dailydotdev/shared/src/components/post/freeform';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { useNotificationToggle } from '@dailydotdev/shared/src/hooks/notifications';
import { useMutation } from 'react-query';
import {
  createPost,
  CreatePostProps,
} from '@dailydotdev/shared/src/graphql/posts';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';

function WritePost(): ReactElement {
  const { query, isReady, push } = useRouter();
  const { shouldShowCta, isEnabled, onToggle, onSubmitted } =
    useNotificationToggle();
  const { displayToast } = useToastNotification();
  const { squad, isForbidden, isLoading, isFetched } = useSquad({
    handle: query?.handle as string,
  });
  const { mutateAsync: onCreatePost, isLoading: isPosting } = useMutation(
    createPost,
    {
      onSuccess: async (post) => {
        await onSubmitted();
        await push(post.commentsPermalink);
      },
      onError: (data: ApiErrorResult) => {
        if (data?.response?.errors?.[0]) {
          displayToast(data?.response?.errors?.[0].message);
        }
      },
    },
  );

  const onClickSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (isPosting) return null;

    const data = formToJson<CreatePostProps>(e.currentTarget);

    return onCreatePost({ ...data, sourceId: squad.id });
  };

  if (isLoading || !isReady || !isFetched) return <WriteFreeFormSkeleton />;

  if (isForbidden || !verifyPermission(squad, SourcePermissions.Post)) {
    return <Unauthorized />;
  }

  if (isLoading || !isReady || !squad || (isFetched && !squad)) return <></>;

  return (
    <WritePageContainer>
      <WritePostHeader squad={squad} />
      <WritePageMain onSubmit={onClickSubmit}>
        <ImageInput
          className={{
            container:
              '!w-[11.5rem] border-none bg-theme-bg-tertiary text-theme-label-tertiary',
          }}
          enableHover={false}
          fallbackImage={null}
          closeable
          name="image"
        >
          <CameraIcon secondary />
          <span className="flex flex-row ml-1.5 font-bold typo-callout">
            Cover image
          </span>
        </ImageInput>
        <TextField
          className={{ container: 'mt-6' }}
          inputId="title"
          name="title"
          label="Post Title*"
          placeholder="Give your post a title"
          required
        />
        <MarkdownInput
          className="mt-4"
          onSubmit={() => {}}
          sourceId={squad.id}
          textareaProps={{ name: 'content', required: true }}
        />
        <span className="flex flex-row items-center mt-4">
          {shouldShowCta && (
            <Switch
              data-testId="push_notification-switch"
              inputId="push_notification-switch"
              name="push_notification"
              labelClassName="flex-1 font-normal"
              className="py-3 w-full max-w-full"
              compact={false}
              checked={isEnabled}
              onToggle={onToggle}
            >
              Receive updates whenever your Squad members engage with your post
            </Switch>
          )}
          <Button
            type="submit"
            className="ml-auto btn-primary-cabbage"
            disabled={isPosting}
          >
            Post
          </Button>
        </span>
      </WritePageMain>
    </WritePageContainer>
  );
}

WritePost.getLayout = getMainLayout;

export default WritePost;
