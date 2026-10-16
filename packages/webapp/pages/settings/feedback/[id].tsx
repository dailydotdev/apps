import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { FeedbackThread } from '@dailydotdev/shared/src/components/feedback/FeedbackThread';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { feedbackQueryOptions } from '@dailydotdev/shared/src/graphql/feedback';
import { AccountPageContainer } from '../../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../../components/layouts/SettingsLayout';
import { defaultSeo, noindexSeoProps } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Your Feedback'),
  ...noindexSeoProps,
};

const AccountFeedbackThreadPage = (): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const idParam = router.query.id;
  const id = typeof idParam === 'string' ? idParam : '';
  const query = useQuery(feedbackQueryOptions({ id }));

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
    content = (
      <FeedbackThread item={query.data} isTeam={false} viewerId={user?.id} />
    );
  }

  return (
    <AccountPageContainer
      title="Feedback"
      onBack={() => router.push('/settings/feedback')}
    >
      {content}
    </AccountPageContainer>
  );
};

AccountFeedbackThreadPage.getLayout = getSettingsLayout;
AccountFeedbackThreadPage.layoutProps = { seo };

export default AccountFeedbackThreadPage;
