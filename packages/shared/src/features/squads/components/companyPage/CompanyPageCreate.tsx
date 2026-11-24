import type { FormEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import { TextField } from '../../../../components/fields/TextField';
import Textarea from '../../../../components/fields/Textarea';
import { AtIcon, LinkIcon, SquadIcon } from '../../../../components/icons';
import { Dropdown } from '../../../../components/fields/Dropdown';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useSquadCreate } from '../../../../hooks/squads/useSquadCreate';
import { useSquadCategories } from '../../../../hooks/squads/useSquadCategories';
import { checkExistingHandle, PrivacyOption } from '../../../../graphql/squads';
import { SourceMemberRole } from '../../../../graphql/sources';
import { AuthTriggers } from '../../../../lib/auth';
import { cloudinarySquadsImageFallback } from '../../../../lib/image';
import { parseHttpUrl } from '../../../../lib/links';
import { SquadUploadButton } from '../manage/SquadUploadButton';
import { toSquadHandle } from '../../lib/handle';
import { getStartupsCheckoutUrl } from '../../lib/routes';
import { getSquadId } from '../../lib/features';
import { isSquadPlan, SquadPlan } from '../../lib/plans';
import {
  CheckoutCta,
  CheckoutShell,
  CheckoutStage,
  CheckoutTitle,
} from '../checkout/CheckoutShell';
import { AccountStep } from '../checkout/StartupsCheckout';
import { StartupsHotjarEvent, trackHotjarEvent } from '../../../../lib/hotjar';
import { StartupsNameStunt } from '../checkout/StartupsNameStunt';

const FORM_ID = 'company-page-form';
const DESCRIPTION_MAX_LENGTH = 250;

/** A visitor with no account signs up here, then gets the form. */
const CompanyPageSignUp = (): ReactElement => (
  <AccountStep
    trigger={AuthTriggers.CompanyPage}
    signUpTitle="Create your free company page"
    signUpDescription="It takes two minutes. No credit card needed."
    logInDescription="Log in, then set up your company page."
  />
);

/**
 * The free company page form: a public squad where only its team posts, with
 * no privacy or posting settings to choose.
 */
export interface CompanyPagePrefill {
  name?: string;
  handle?: string;
  description?: string;
  website?: string;
}

interface CompanyPageCreateProps {
  /** What we could read from the founder's site before it fell short. */
  prefill?: CompanyPagePrefill;
}

export const CompanyPageCreate = ({
  prefill,
}: CompanyPageCreateProps = {}): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [name, setName] = useState(prefill?.name ?? '');
  const [handle, setHandle] = useState(prefill?.handle ?? '');
  const [isHandleEdited, setHandleEdited] = useState(!!prefill?.handle);
  const [handleHint, setHandleHint] = useState<string>();
  const [description, setDescription] = useState(prefill?.description ?? '');
  const [website, setWebsite] = useState(prefill?.website ?? '');
  const [categoryId, setCategoryId] = useState<string>();
  const [image, setImage] = useState<{ preview: string; file: File }>();
  const [isChecking, setChecking] = useState(false);
  const { data: categoryPages } = useSquadCategories();
  const categories =
    categoryPages?.pages.flatMap((page) =>
      page.categories.edges.map(({ node }) => node),
    ) ?? [];
  const { onCreateSquad, isLoading } = useSquadCreate({
    onSuccess: (squad) => {
      trackHotjarEvent(StartupsHotjarEvent.CompanyPageCreated);
      return router.push(
        router.query.checkout === '1'
          ? getStartupsCheckoutUrl({
              plan: isSquadPlan(router.query.plan)
                ? router.query.plan
                : SquadPlan.Starter,
              sourceId: getSquadId(squad),
            })
          : squad.permalink,
      );
    },
  });

  if (!user) {
    return <CompanyPageSignUp />;
  }

  const suggestedHandle = name.trim() ? toSquadHandle(name) : '';
  const activeHandle = isHandleEdited ? handle : suggestedHandle;
  const websiteUrl = website.trim() ? parseHttpUrl(website.trim()) : null;
  const isWebsiteInvalid = !!website.trim() && !websiteUrl;
  const canSubmit =
    !!name.trim() &&
    !!activeHandle &&
    !!description.trim() &&
    !isWebsiteInvalid &&
    !isChecking;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || isLoading) {
      return;
    }

    setChecking(true);
    const isTaken = await checkExistingHandle(activeHandle).finally(() =>
      setChecking(false),
    );

    if (isTaken) {
      setHandleEdited(true);
      setHandle(activeHandle);
      setHandleHint('This handle is taken. Try another one.');
      return;
    }

    onCreateSquad({
      name: name.trim(),
      handle: activeHandle,
      description: description.trim(),
      website: websiteUrl ?? undefined,
      categoryId: categoryId || undefined,
      file: image?.file,
      status: PrivacyOption.Public,
      memberPostingRole: SourceMemberRole.Moderator,
      memberInviteRole: SourceMemberRole.Member,
      moderationRequired: false,
      company: true,
    });
  };

  return (
    <CheckoutShell
      current={CheckoutStage.Company}
      isTall
      aside={<StartupsNameStunt name={name} />}
    >
      {prefill?.website ? (
        <CheckoutTitle
          title="Finish your company page"
          description={`We couldn't get everything from ${prefill.website.replace(
            /^https?:\/\//,
            '',
          )}. Add what's missing and you're done.`}
        />
      ) : (
        <CheckoutTitle
          title="Set up your company page"
          description="Add your logo, name and a short description."
        />
      )}
      <form
        id={FORM_ID}
        className="flex w-full flex-col gap-6"
        onSubmit={onSubmit}
        noValidate
      >
        <div className="flex items-center gap-4">
          <div className="relative size-24 shrink-0">
            <img
              src={image?.preview ?? cloudinarySquadsImageFallback}
              alt="Company logo"
              className="size-full rounded-full object-cover"
            />
            <SquadUploadButton
              label="logo"
              onFile={(preview, file) => setImage({ preview, file })}
              className="absolute inset-0 items-center justify-center"
            />
          </div>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
            className="flex-1"
          >
            Add your logo, website and a short description and we boost your
            first post with $100.
          </Typography>
        </div>
        <TextField
          label="Company name"
          inputId="name"
          name="name"
          autoComplete="organization"
          leftIcon={<SquadIcon />}
          value={name}
          valueChanged={setName}
          className={{ container: 'w-full' }}
        />
        <TextField
          label="Page handle"
          inputId="handle"
          name="handle"
          leftIcon={<AtIcon />}
          value={activeHandle}
          valueChanged={(value) => {
            // The field echoes the value it is given, which isn't an edit
            if (value === activeHandle) {
              return;
            }

            setHandleEdited(true);
            setHandle(value);
            setHandleHint(undefined);
          }}
          valid={handleHint ? false : undefined}
          hint={
            handleHint ?? `daily.dev/squads/${activeHandle || 'yourcompany'}`
          }
          className={{ container: 'w-full' }}
        />
        <Textarea
          label="What does it do?"
          inputId="description"
          name="description"
          rows={3}
          value={description}
          maxLength={DESCRIPTION_MAX_LENGTH}
          valueChanged={setDescription}
          hint="One or two sentences."
          className={{ container: 'w-full' }}
        />
        <TextField
          label="Website"
          inputId="website"
          name="website"
          inputMode="url"
          leftIcon={<LinkIcon />}
          value={website}
          valueChanged={setWebsite}
          valid={isWebsiteInvalid ? false : undefined}
          hint={isWebsiteInvalid ? 'Enter your site, like acme.dev' : undefined}
          className={{ container: 'w-full' }}
        />
        {!!categories.length && (
          <Dropdown
            placeholder="Category (optional)"
            className={{ container: 'w-full' }}
            options={categories.map(({ title }) => title)}
            selectedIndex={categories.findIndex(({ id }) => id === categoryId)}
            onChange={(_, index) => setCategoryId(categories[index].id)}
          />
        )}
        <CheckoutCta>
          <Button
            type="submit"
            variant={ButtonVariant.Primary}
            className="flex-1"
            loading={isLoading || isChecking}
            disabled={!canSubmit || isLoading}
          >
            Create page
          </Button>
        </CheckoutCta>
      </form>
    </CheckoutShell>
  );
};
