import type { FormEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import { TextField } from '../../../../components/fields/TextField';
import Textarea from '../../../../components/fields/Textarea';
import { AtIcon, SquadIcon } from '../../../../components/icons';
import OrDivider from '../../../../components/auth/OrDivider';
import { Dropdown } from '../../../../components/fields/Dropdown';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { usePixelsContext } from '../../../../contexts/PixelsContext';
import { useSquadCreate } from '../../../../hooks/squads/useSquadCreate';
import { useSquadCategories } from '../../../../hooks/squads/useSquadCategories';
import { checkExistingHandle, PrivacyOption } from '../../../../graphql/squads';
import { SourceMemberRole } from '../../../../graphql/sources';
import { AuthTriggers } from '../../../../lib/auth';
import { cloudinarySquadsImageFallback } from '../../../../lib/image';
import { LogEvent } from '../../../../lib/log';
import { SquadUploadButton } from '../manage/SquadUploadButton';
import { toSquadHandle } from '../../lib/handle';
import { getStartupsCheckoutUrl } from '../../lib/routes';
import { getSquadId } from '../../lib/features';
import { isSquadPlan, SquadPlan } from '../../lib/plans';
import { companyPagePrompt } from '../../lib/companyPage';
import { trackStartupsSignup } from '../../lib/startupsAdEvents';
import { getFirstQueryParam } from '../../../../lib/func';
import { AgentPromptButton } from '../AgentPromptButton';
import {
  CheckoutCta,
  CheckoutShell,
  CheckoutStage,
  CheckoutTitle,
} from '../checkout/CheckoutShell';
import { AccountStep } from '../checkout/StartupsCheckout';
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

/** Copies the setup prompt; the founder pastes it into their agent. */
const AgentSetupButton = (): ReactElement => {
  const { logEvent } = useLogContext();

  return (
    <AgentPromptButton
      getPrompt={() => companyPagePrompt}
      label="Continue with your agent"
      hint="Copies a prompt for Claude Code, Codex, Cursor or any agent."
      copiedHint="Paste it into your agent to set up the page."
      onCopy={() => logEvent({ event_name: LogEvent.CopyCompanyPagePrompt })}
    />
  );
};

/**
 * The free company page form: a public squad where only its team posts, with
 * no privacy or posting settings to choose.
 */
export const CompanyPageCreate = (): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [isHandleEdited, setHandleEdited] = useState(false);
  const [handleHint, setHandleHint] = useState<string>();
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>();
  const [image, setImage] = useState<{ preview: string; file: File }>();
  const [isChecking, setChecking] = useState(false);
  const { data: categoryPages } = useSquadCategories();
  const categories =
    categoryPages?.pages.flatMap((page) =>
      page.categories.edges.map(({ node }) => node),
    ) ?? [];
  const { trackEvent } = usePixelsContext();
  const { onCreateSquad, isLoading } = useSquadCreate({
    onSuccess: (squad) => {
      if (user) {
        trackStartupsSignup(trackEvent, {
          userId: user.id,
          email: user.email,
          plan: getFirstQueryParam(router.query.plan) ?? 'free',
        });
      }

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
  const canSubmit =
    !!name.trim() && !!activeHandle && !!description.trim() && !isChecking;

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
      <CheckoutTitle
        title="Set up your company page"
        description="Your agent can fill it in from your site, or you can do it here."
      />
      <form
        id={FORM_ID}
        className="flex w-full flex-col gap-6"
        onSubmit={onSubmit}
        noValidate
      >
        <AgentSetupButton />
        <OrDivider
          label="or fill it in yourself"
          className={{
            text: 'text-text-tertiary',
            border: 'bg-border-subtlest-tertiary',
          }}
        />
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
            Use your product logo. Your page needs a logo and a description to
            show up in the directory.
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
