import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { FeedbackThread } from '@dailydotdev/shared/src/components/feedback/FeedbackThread';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { feedbackQueryOptions } from '@dailydotdev/shared/src/graphql/feedback';
import { getLayout } from '../../../components/layouts/MainLayout';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import { defaultSeo, noindexSeoProps } from '../../../next-seo';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Feedback thread'),
  ...noindexSeoProps,
};

const TeamFeedbackThreadPage = (): ReactElement | null => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  const isTeamMember = !!user?.isTeamMember;
  const idParam = router.query.id;
  const id = typeof idParam === 'string' ? idParam : '';
  const query = useQuery({
    ...feedbackQueryOptions({ id }),
    enabled: isAuthReady && isTeamMember && !!id,
  });

  useEffect(() => {
    if (isAuthReady && !isTeamMember) {
      router.replace('/');
    }
  }, [isAuthReady, isTeamMember, router]);

  if (!isAuthReady || !router.isReady) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!isTeamMember) {
    return null;
  }

  let content: ReactElement;
  if (query.isPending) {
    content = (
      <div className="flex w-full justify-center py-8">
        <Loader />
      </div>
    );
  } else if (query.isError || !query.data) {
    content = (
      <div className="rounded-16 border border-border-subtlest-tertiary p-4">
        <Typography type={TypographyType.Body}>
          This feedback is not available.
        </Typography>
      </div>
    );
  } else {
    content = <FeedbackThread item={query.data} isTeam viewerId={user?.id} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
      <div className="flex items-center gap-2">
        <Button
          tag="a"
          href="/team/feedback"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<ArrowIcon className="-rotate-90" />}
          aria-label="Back to open feedback"
        />
        <Typography type={TypographyType.Title2} bold>
          Feedback thread
        </Typography>
      </div>
      {content}
    </div>
  );
};

TeamFeedbackThreadPage.getLayout = getLayout;
TeamFeedbackThreadPage.layoutProps = { seo };

export default TeamFeedbackThreadPage;
