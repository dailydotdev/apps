import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import type { NextSeoProps } from 'next-seo/lib/types';
import { MoveToIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { UserExperienceList } from '@dailydotdev/shared/src/features/profile/components/experience/UserExperiencesList';
import type { UserExperience } from '@dailydotdev/shared/src/graphql/user/profile';
import type { ProfileLayoutProps } from './index';
import { getProfileSeoDefaults } from './index';
import { getTemplatedTitle } from '../utils';

interface ProfileExperienceDetailPageProps extends ProfileLayoutProps {
  experiences: UserExperience[] | undefined;
  title: string;
  seoTitle: string;
}

export function ProfileExperienceDetailPage({
  user,
  noindex,
  experiences,
  title,
  seoTitle,
}: ProfileExperienceDetailPageProps): ReactElement {
  const seo: NextSeoProps = {
    ...getProfileSeoDefaults(
      user,
      {
        title: getTemplatedTitle(seoTitle),
      },
      noindex,
    ),
  };

  return (
    <>
      <NextSeo {...seo} />
      <div className="rounded-16 border border-border-subtlest-tertiary">
        <header className="flex h-14 items-center gap-1 border-b border-border-subtlest-tertiary px-4">
          <Link href={`${webappUrl}/${user.username}`} passHref>
            <Button
              size={ButtonSize.Small}
              icon={<MoveToIcon className="rotate-180" />}
            />
          </Link>
          <Typography type={TypographyType.Title3} bold>
            {title}
          </Typography>
        </header>
        <div className="px-6">
          <UserExperienceList experiences={experiences} user={user} />
        </div>
      </div>
    </>
  );
}
