import React, {
  FormEvent,
  HTMLAttributes,
  ReactElement,
  useContext,
  useRef,
  useState,
} from 'react';
import styled from '@emotion/styled';
import { updateProfile, UserProfile } from '../../lib/user';
import sizeN from '@dailydotdev/shared/macros/sizeN.macro';
import rem from '@dailydotdev/shared/macros/rem.macro';
import { typoBody, typoCallout } from '../../styles/typography';
import { focusOutline } from '../../styles/helpers';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import ArrowIcon from '@dailydotdev/shared/icons/arrow.svg';
import AuthContext from '../../contexts/AuthContext';
import { formToJson } from '../../lib/form';

export type RegistrationMode = 'default' | 'author' | 'update';

export interface ProfileForm extends HTMLAttributes<HTMLFormElement> {
  setDisableSubmit?: (disable: boolean) => void;
  onSuccessfulSubmit?: () => void | Promise<void>;
  mode?: RegistrationMode;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: ${sizeN(10)} 0 0;
  padding: 0;
`;

const FormField = styled(TextField)`
  align-self: stretch;
  margin-bottom: ${sizeN(3)};
`;

const OptionalSummary = styled.summary`
  display: flex;
  height: ${sizeN(10)};
  align-items: center;
  color: var(--theme-label-tertiary);
  cursor: pointer;
  font-weight: bold;
  ${typoCallout}
  ${focusOutline}

  &::-webkit-details-marker {
    display: none;
  }

  & .icon {
    margin-left: auto;
    font-size: ${sizeN(5)};
    transform: rotate(90deg);
    transition: transform 0.1s linear;
  }
`;

const OptionalFields = styled.details`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-bottom: ${rem(1)} solid var(--theme-divider-tertiary);

  &[open] {
    padding-bottom: ${sizeN(3)};

    ${OptionalSummary} .icon {
      transform: rotate(180deg);
    }
  }
`;

const SectionHeading = styled.h3`
  margin: 0 0 ${sizeN(4)};
  color: var(--theme-label-tertiary);
  ${typoBody}

  ${OptionalSummary} + & {
    margin-top: ${sizeN(3)};
  }

  /* stylelint-disable-next-line no-duplicate-selectors */
  ${FormField} + & {
    margin-top: ${sizeN(10)};
  }
`;

const FormSwitch = styled(Switch)`
  margin: ${sizeN(3)} 0;

  ${SectionHeading} + & {
    margin-top: -${sizeN(1)};
  }
`;

const defaultEmailHint = 'Not publicly shared';

export default function ProfileForm({
  setDisableSubmit,
  onSuccessfulSubmit,
  mode,
  ...props
}: ProfileForm): ReactElement {
  const { user, updateUser } = useContext(AuthContext);

  const formRef = useRef<HTMLFormElement>(null);

  const [usernameHint, setUsernameHint] = useState<string>();
  const [twitterHint, setTwitterHint] = useState<string>();
  const [githubHint, setGithubHint] = useState<string>();
  const [hashnodeHint, setHashnodeHint] = useState<string>();
  const [emailHint, setEmailHint] = useState(defaultEmailHint);

  const updateDisableSubmit = () => {
    if (formRef.current) {
      setDisableSubmit?.(!formRef.current.checkValidity());
    }
  };

  const usernameValidityUpdated = (valid: boolean) => {
    if (!valid && !usernameHint) {
      setUsernameHint('Username can only contain letters, numbers and _');
    }
    updateDisableSubmit();
  };

  const emailValidityUpdated = (valid: boolean) => {
    if (!valid && emailHint === defaultEmailHint) {
      setEmailHint('Must be a valid email');
    }
    updateDisableSubmit();
  };

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setDisableSubmit?.(true);
    const data = formToJson<UserProfile>(formRef.current, {
      name: '',
      email: '',
      username: '',
    });

    const res = await updateProfile(data);
    if ('error' in res) {
      if ('code' in res && res.code === 1) {
        if (res.field === 'email') {
          setEmailHint('This email is already used');
        } else if (res.field === 'username') {
          setUsernameHint('This username is already taken');
        } else if (res.field === 'twitter') {
          setTwitterHint('This Twitter handle is already used');
        } else if (res.field === 'github') {
          setGithubHint('This GitHub handle is already used');
        } else if (res.field === 'hashnode') {
          setGithubHint('This Hashnode handle is already used');
        }
      }
    } else {
      await updateUser({ ...user, ...res });
      setDisableSubmit?.(false);
      onSuccessfulSubmit?.();
    }
  };

  const twitterField = (
    <FormField
      compact={true}
      inputId="twitter"
      name="twitter"
      label="Twitter"
      value={user.twitter}
      hint={twitterHint}
      valid={!twitterHint}
      placeholder="handle"
      pattern="^@?(\w){1,15}$"
      maxLength={15}
      validityChanged={updateDisableSubmit}
      valueChanged={() => twitterHint && setTwitterHint(null)}
      required={mode === 'author'}
    />
  );

  const optionalFields = (
    <>
      <SectionHeading>About</SectionHeading>
      <FormField
        compact={true}
        inputId="bio"
        name="bio"
        label="Bio"
        value={user.bio}
        maxLength={160}
        validityChanged={updateDisableSubmit}
      />
      <FormField
        compact={true}
        inputId="company"
        name="company"
        label="Company"
        value={user.company}
        maxLength={50}
        validityChanged={updateDisableSubmit}
      />
      <FormField
        compact={true}
        inputId="title"
        name="title"
        label="Job title"
        value={user.title}
        maxLength={50}
        validityChanged={updateDisableSubmit}
      />
      <SectionHeading>Social</SectionHeading>
      {mode !== 'author' && twitterField}
      <FormField
        compact={true}
        inputId="github"
        name="github"
        label="GitHub"
        value={user.github}
        hint={githubHint}
        valid={!githubHint}
        placeholder="handle"
        pattern="^@?([\w-]){1,39}$"
        maxLength={39}
        validityChanged={updateDisableSubmit}
        valueChanged={() => githubHint && setGithubHint(null)}
      />
      <FormField
        compact={true}
        inputId="hashnode"
        name="hashnode"
        label="Hashnode"
        value={user.hashnode}
        hint={hashnodeHint}
        valid={!hashnodeHint}
        placeholder="handle"
        pattern="^@?([\w-]){1,39}$"
        maxLength={39}
        validityChanged={updateDisableSubmit}
        valueChanged={() => hashnodeHint && setHashnodeHint(null)}
      />
      <FormField
        compact={true}
        inputId="portfolio"
        name="portfolio"
        label="Website"
        type="url"
        value={user.portfolio}
        validityChanged={updateDisableSubmit}
      />
    </>
  );

  return (
    <Form ref={formRef} onSubmit={onSubmit} {...props} data-testid="form">
      <SectionHeading>Profile</SectionHeading>
      <FormField
        compact={true}
        inputId="name"
        name="name"
        label="Name"
        value={user.name}
        required
        maxLength={50}
        validityChanged={updateDisableSubmit}
      />
      <FormField
        compact={true}
        inputId="username"
        name="username"
        label="Username"
        value={user.username}
        required
        hint={usernameHint}
        valid={!usernameHint}
        validityChanged={usernameValidityUpdated}
        maxLength={15}
        pattern="^@?(\w){1,15}$"
        valueChanged={() => usernameHint && setUsernameHint(null)}
      />
      <FormField
        compact={true}
        inputId="email"
        name="email"
        label="Email"
        type="email"
        value={user.email}
        required
        hint={emailHint}
        valid={emailHint === defaultEmailHint}
        validityChanged={emailValidityUpdated}
        valueChanged={() =>
          emailHint !== defaultEmailHint && setEmailHint(defaultEmailHint)
        }
      />
      {mode === 'author' && twitterField}
      {mode === 'update' && (
        <>
          {optionalFields}
          <SectionHeading>Settings</SectionHeading>
        </>
      )}
      <FormSwitch
        name="acceptedMarketing"
        inputId="acceptedMarketing"
        checked={user.acceptedMarketing}
      >
        Subscribe to the Weekly Recap
      </FormSwitch>
      {mode !== 'update' && (
        <OptionalFields>
          <OptionalSummary>
            More details (optional)
            <ArrowIcon />
          </OptionalSummary>
          {optionalFields}
        </OptionalFields>
      )}
    </Form>
  );
}
