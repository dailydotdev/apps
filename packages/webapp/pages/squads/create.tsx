import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import { WriteFreeFormSkeleton } from '@dailydotdev/shared/src/components/post/freeform';
import { SmartComposerModal } from '@dailydotdev/shared/src/components/modals/post/SmartComposerModal';
import type { ComposerKind } from '@dailydotdev/shared/src/components/post/composer/types';
import { WriteFormTab } from '@dailydotdev/shared/src/components/fields/form/common';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { getFirstQueryParam } from '@dailydotdev/shared/src/lib/func';
import { getSquadsCreatePrefillState } from '../../lib/squadsCreatePrefill';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';

const seoTitles = getPageSeoTitles('Create post');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  nofollow: true,
  noindex: true,
  ...defaultSeo,
};

const displayToKind = (
  display: WriteFormTab | null,
): ComposerKind | undefined => {
  switch (display) {
    case WriteFormTab.Standup:
      return 'standup';
    case WriteFormTab.Poll:
      return 'poll';
    case WriteFormTab.Share:
      return 'link';
    default:
      return undefined;
  }
};

function CreatePost(): ReactElement {
  const router = useRouter();
  const { query, isReady: isRouteReady } = router;
  const { user, isAuthReady, isFetched } = useAuthContext();

  const prefill = useMemo(() => getSquadsCreatePrefillState(query), [query]);

  if (!isFetched || !isAuthReady || !isRouteReady) {
    return <WriteFreeFormSkeleton />;
  }

  if (!user) {
    return <Unauthorized />;
  }

  return (
    <SmartComposerModal
      isOpen
      onRequestClose={() => router.push(webappUrl)}
      initialSquadHandle={getFirstQueryParam(query.sid)}
      initialKind={displayToKind(prefill.initialDisplay)}
      initialUrl={prefill.initialShareUrl}
      initialTitle={prefill.initialDraft.title}
      initialContent={prefill.initialDraft.content}
      initialCommentary={prefill.initialShareCommentary}
    />
  );
}

CreatePost.getLayout = getMainLayout;
CreatePost.layoutProps = { seo };

export default CreatePost;
