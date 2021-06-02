import React, { ReactElement } from 'react';
import {
  getLayout as getProfileLayout,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import { reputationGuide } from '@dailydotdev/shared/src/lib/constants';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const ProfilePage = (): ReactElement => {
  return (
    <section className="my-6 typo-callout">
      Earning reputation points will allow you to gain special privileges
      (coming soon).
      <br />
      In the meantime,{' '}
      <a
        href={reputationGuide}
        target="_blank"
        rel="noopener"
        className="text-theme-label-link no-underline"
      >
        learn how to earn reputation points.
      </a>
    </section>
  );
};

ProfilePage.getLayout = getProfileLayout;

export default ProfilePage;
