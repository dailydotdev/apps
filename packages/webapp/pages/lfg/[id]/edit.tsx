import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import type { NextSeoProps } from 'next-seo';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { LfgComposer } from '@dailydotdev/shared/src/features/lfg/components/composer/LfgComposer';
import { lfgPostQueryOptions } from '@dailydotdev/shared/src/features/lfg/queries';
import { getLfgUrl } from '@dailydotdev/shared/src/features/lfg/lib/format';
import { LfgPostStatus } from '@dailydotdev/shared/src/features/lfg/types';
import { getLfgLayout, LfgGate } from '../../../components/lfg/LfgGate';
import { getPageSeoTitles } from '../../../components/layouts/utils';
import { noindexSeoProps } from '../../../next-seo';

const seo: NextSeoProps = {
  ...getPageSeoTitles('Edit post · Looking for group'),
  ...noindexSeoProps,
};

// Only the author edits, and only while the post is open.
const EditLfgPost = ({ id }: { id: string }): ReactElement | null => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { data: post, isPending } = useQuery(lfgPostQueryOptions(user, id));
  const canEdit =
    !!post && post.author.id === user?.id && post.status === LfgPostStatus.Open;

  useEffect(() => {
    if (!isPending && !canEdit) {
      router.replace(getLfgUrl(post ? id : undefined));
    }
  }, [canEdit, id, isPending, post, router]);

  if (!canEdit) {
    return null;
  }

  return <LfgComposer post={post} />;
};

const EditLfgPostPage = (): ReactElement => {
  const { query } = useRouter();
  const id = typeof query.id === 'string' ? query.id : '';

  return (
    <LfgGate>
      <EditLfgPost id={id} />
    </LfgGate>
  );
};

EditLfgPostPage.getLayout = getLfgLayout;
EditLfgPostPage.layoutProps = { seo };

export default EditLfgPostPage;
