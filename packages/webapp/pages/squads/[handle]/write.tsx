import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import usePostById from '@dailydotdev/shared/src/hooks/usePostById';
import { useSquad } from '@dailydotdev/shared/src/hooks';
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
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';

function WritePost(): ReactElement {
  const { query, isReady } = useRouter();
  const { post } = usePostById({ id: query.pid as string });
  const { squad, isForbidden, isLoading, isFetched } = useSquad({
    handle: query?.handle as string,
  });

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
    </WritePageContainer>
  );
}

WritePost.getLayout = getMainLayout;

export default WritePost;
