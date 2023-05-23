import React, { ReactElement } from 'react';
import {
  BasePageContainer,
  pageBorders,
} from '@dailydotdev/shared/src/components/utilities';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import usePostById from '@dailydotdev/shared/src/hooks/usePostById';
import { useSquad } from '@dailydotdev/shared/src/hooks';
import SourceButton from '@dailydotdev/shared/src/components/cards/SourceButton';
import ImageInput from '@dailydotdev/shared/src/components/fields/ImageInput';
import CameraIcon from '@dailydotdev/shared/src/components/icons/Camera';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import MarkdownInput from '@dailydotdev/shared/src/components/fields/MarkdownInput';
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';

function WritePost(): ReactElement {
  const { query, isReady } = useRouter();
  const { post } = usePostById({ id: query.pid as string });
  const { squad, isForbidden, isLoading, isFetched } = useSquad({
    handle: query?.handle as string,
  });
  console.log('writing');

  // if (isForbidden || verifyPermission(squad, SourcePermissions.Post)) {
  //   return <Unauthorized />;
  // }

  if (isLoading || !isReady || !squad || (isFetched && !squad)) return <></>;

  console.log(squad);

  return (
    <BasePageContainer
      className={classNames('!p-0 laptop:min-h-page h-full', pageBorders)}
    >
      <header className="flex flex-row items-center py-4 px-6 border-b border-theme-divider-tertiary">
        <h1 className="font-bold typo-title3">{post ? 'Edit' : 'New'} post</h1>
        <div className="flex flex-col ml-auto text-right">
          <span className="font-bold text typo-subhead">{squad.name}</span>
          <span className="typo-caption1 text-theme-label-tertiary">
            @{squad.handle}
          </span>
        </div>
        <SourceButton className="ml-1.5" source={squad} />
      </header>
      <main className="flex flex-col py-6 px-4">
        <ImageInput
          className={{
            container:
              'w-[11.5rem] border-none bg-theme-bg-tertiary text-theme-label-tertiary',
          }}
          enableHover={false}
          fallbackImage={null}
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
          onSubmit={() => console.log('test')}
          postId={post?.id}
          sourceId={squad.id}
        />
      </main>
    </BasePageContainer>
  );
}

WritePost.getLayout = getMainLayout;

export default WritePost;
