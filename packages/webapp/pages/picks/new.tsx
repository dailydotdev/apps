import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { myCurrentPicksQueryOptions } from '@dailydotdev/shared/src/graphql/picks';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featureWeeklyPicks } from '@dailydotdev/shared/src/lib/featureManagement';
import { PicksEditor } from '@dailydotdev/shared/src/components/picks/PicksEditor';
import { getPicksOrigin } from '@dailydotdev/shared/src/hooks/picks/usePicksEditor';
import ProtectedPage from '../../components/ProtectedPage';
import { getLayout } from '../../components/layouts/MainLayout';
import { noindexSeoProps } from '../../next-seo';

const getQueryValue = (value?: string | string[]): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const NewPicksContent = (): ReactElement | null => {
  const router = useRouter();
  const { user } = useAuthContext();
  const fromPicksId = getQueryValue(router.query.from);
  const addPostId = getQueryValue(router.query.add);
  // The flag only gates the entry points. Arriving from a picks page opens
  // the editor outside the rollout, and so does having picks this week, so
  // someone who created via a link can come back and edit them.
  const { value: isEnabled, isLoading: isFlagLoading } = useConditionalFeature({
    feature: featureWeeklyPicks,
    shouldEvaluate: router.isReady && !fromPicksId,
  });
  const { data: currentPicks, isError: isCurrentError } = useQuery(
    myCurrentPicksQueryOptions(user),
  );
  const hasCurrentPicks = !!currentPicks;
  // A failed read settles too: the editor shows its own retry state.
  const isLoading =
    isFlagLoading || (currentPicks === undefined && !isCurrentError);
  const canOpen = !!fromPicksId || hasCurrentPicks || (!isLoading && isEnabled);
  // Once open, stay open: the editor refetches the same read on mount and
  // its retry state must not unmount it.
  const [hasOpened, setHasOpened] = useState(false);
  const isOpen = hasOpened || canOpen;

  useEffect(() => {
    if (canOpen) {
      setHasOpened(true);
    }
  }, [canOpen]);

  useEffect(() => {
    if (user && router.isReady && !isLoading && !isOpen) {
      router.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router.isReady, isLoading, isOpen]);

  if (!user || !router.isReady || !isOpen) {
    return null;
  }

  return (
    <PicksEditor
      origin={getPicksOrigin(router.query.origin)}
      fromPicksId={fromPicksId}
      addPostId={addPostId}
    />
  );
};

// ProtectedPage comes first so a logged-out visitor is sent to auth, not
// bounced to the feed by the flag check.
const NewPicksPage = (): ReactElement => (
  <ProtectedPage>
    <NewPicksContent />
  </ProtectedPage>
);

const seo: NextSeoProps = {
  title: 'Weekly picks',
  ...noindexSeoProps,
};

NewPicksPage.getLayout = getLayout;
NewPicksPage.layoutProps = { seo };

export default NewPicksPage;
