import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { FormProvider } from 'react-hook-form';
import UserWorkExperienceForm from '@dailydotdev/shared/src/features/profile/components/experience/forms/UserWorkExperienceForm';
import useUserExperienceForm, {
  UserExperienceType,
} from '@dailydotdev/shared/src/hooks/useUserExperienceForm';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { getSettingsLayout } from '../../../../components/layouts/SettingsLayout';
import { AccountPageContainer } from '../../../../components/layouts/SettingsLayout/AccountPageContainer';
import { defaultSeo } from '../../../../next-seo';
import { getTemplatedTitle } from '../../../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Edit experience'),
};

const Page = (): ReactElement => {
  const existingValues = null;
  const { methods, save, isPending } = useUserExperienceForm({
    id: existingValues?.id,
    defaultValues: existingValues,
    type: UserExperienceType.Work,
  });
  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-1"
        onSubmit={methods.handleSubmit(() => save())}
      >
        <AccountPageContainer
          title="Experience"
          actions={
            <Button
              type="submit"
              className="ml-auto"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              disabled={isPending}
              loading={isPending}
            >
              Save
            </Button>
          }
        >
          <UserWorkExperienceForm />
        </AccountPageContainer>
      </form>
    </FormProvider>
  );
};

Page.getLayout = getSettingsLayout;
Page.layoutProps = { seo };

export default Page;
