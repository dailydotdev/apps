import React, { ReactElement, useState } from 'react';
import { useRouter } from 'next/router';
import usePostById from '@dailydotdev/shared/src/hooks/usePostById';
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
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';

function WritePost(): ReactElement {
  const { query, isReady } = useRouter();
  const { shouldShowCta, isEnabled, onToggle, onSubmitted } =
    useNotificationToggle();
  const { post } = usePostById({ id: query.pid as string });
  const { squad, isForbidden, isLoading, isFetched } = useSquad({
    handle: query?.handle as string,
  });

  const onCreatePost = () => {
    onSubmitted();
  };

  if (isLoading || !isReady || !isFetched) return <WriteFreeFormSkeleton />;

  if (isForbidden || !verifyPermission(squad, SourcePermissions.Post)) {
    return <Unauthorized />;
  }

  if (isLoading || !isReady || !squad || (isFetched && !squad)) return <></>;

  return (
    <WritePageContainer>
      <WritePostHeader squad={squad} isEdit={!!post} />
      <WritePageMain>
        <ImageInput
          className={{
            container:
              '!w-[11.5rem] border-none bg-theme-bg-tertiary text-theme-label-tertiary',
          }}
          enableHover={false}
          fallbackImage={null}
          closeable
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
        />
        <MarkdownInput
          className="mt-4"
          onSubmit={() => {}}
          postId={post?.id}
          sourceId={squad.id}
        />
      </WritePageMain>
      <span className="flex flex-row items-center px-4">
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
        <Button type="submit" className="ml-auto btn-primary-cabbage">
          Submit
        </Button>
      </span>
    </WritePageContainer>
  );
}

WritePost.getLayout = getMainLayout;

export default WritePost;
