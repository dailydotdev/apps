import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { FormProvider, useForm } from 'react-hook-form';
import UserWorkExperienceForm from '@dailydotdev/shared/src/features/profile/components/experience/forms/UserWorkExperienceForm';
import type { UserExperience } from '@dailydotdev/shared/src/graphql/user/profile';
import { getSettingsLayout } from '../../../../components/layouts/SettingsLayout';
import { AccountPageContainer } from '../../../../components/layouts/SettingsLayout/AccountPageContainer';
import { defaultSeo } from '../../../../next-seo';
import { getTemplatedTitle } from '../../../../components/layouts/utils';

export enum UserExperienceType {
  Work = 'work',
  Education = 'education',
  Project = 'project',
  Certification = 'certification',
}

const defaultValues: Omit<
  UserExperience,
  'type' | 'id' | 'createdAt' | 'company' | 'customCompanyName'
> = {
  title: '',
  description: '',
  subtitle: '',
  startedAt: '',
  endedAt: '',
};

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Edit experience'),
};

const Page = (): ReactElement => {
  const existingValues = null;
  const methods = useForm<UserExperience>({
    defaultValues: existingValues || {
      ...defaultValues,
      type: UserExperienceType.Work,
    },
  });

  return (
    <FormProvider {...methods}>
      <form className="flex flex-1" onSubmit={methods.handleSubmit(() => {})}>
        <AccountPageContainer title="Experience">
          <UserWorkExperienceForm />
        </AccountPageContainer>
      </form>
    </FormProvider>
  );
};

Page.getLayout = getSettingsLayout;
Page.layoutProps = { seo };

export default Page;
