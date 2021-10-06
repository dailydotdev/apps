import React, {
  FormEvent,
  HTMLAttributes,
  ReactElement,
  useContext,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { updateProfile, UserProfile } from '../../lib/user';
import { TextField } from '../fields/TextField';
import { Switch } from '../fields/Switch';
import AuthContext from '../../contexts/AuthContext';
import { formToJson } from '../../lib/form';
import classed from '../../lib/classed';
import styles from './ProfileForm.module.css';
import { Summary, SummaryArrow } from '../utilities';

const REQUIRED_FIELDS_COUNT = 4;

export type RegistrationMode = 'default' | 'author' | 'update';

export interface ProfileFormProps extends HTMLAttributes<HTMLFormElement> {
  setDisableSubmit?: (disable: boolean) => void;
  onSuccessfulSubmit?: (optionalFields: boolean) => void | Promise<void>;
  mode?: RegistrationMode;
}

const FormField = classed(TextField, 'self-stretch mb-3');
const SectionHeading = classed(
  'h3',
  'mb-4 text-theme-label-tertiary typo-body',
  styles.sectionHeading,
);
const FormSwitch = classed(Switch, 'my-3', styles.formSwitch);

const defaultEmailHint = 'Not publicly shared';

export default function ProfileForm({
  setDisableSubmit,
  onSuccessfulSubmit,
  mode,
  className,
  ...props
}: ProfileFormProps): ReactElement {
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
      const filledFields = Object.keys(data).filter(
        (key) => data[key] !== undefined && data[key] !== null,
      );
      onSuccessfulSubmit?.(filledFields.length > REQUIRED_FIELDS_COUNT);
    }
  };

  const twitterField = (
    <FormField
      compact
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
        compact
        inputId="bio"
        name="bio"
        label="Bio"
        value={user.bio}
        maxLength={160}
        validityChanged={updateDisableSubmit}
      />
      <FormField
        compact
        inputId="company"
        name="company"
        label="Company"
        value={user.company}
        maxLength={50}
        validityChanged={updateDisableSubmit}
      />
      <FormField
        compact
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
        compact
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
        compact
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
        compact
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
    <form
      className={classNames(className, 'flex flex-col w-full mt-10 p-0')}
      ref={formRef}
      onSubmit={onSubmit}
      {...props}
      data-testid="form"
    >
      <SectionHeading>Profile</SectionHeading>
      <FormField
        compact
        inputId="name"
        name="name"
        label="Name"
        value={user.name}
        required
        maxLength={50}
        pattern="^\w(.*)?"
        validityChanged={updateDisableSubmit}
      />
      <FormField
        compact
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
        compact
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
        <details
          className={`flex flex-col w-full border-b border-theme-divider-tertiary ${styles.optionalFields}`}
        >
          <Summary className={styles.optionalSummary}>
            <div className="flex items-center h-10 font-bold text-theme-label-tertiary typo-callout">
              More details (optional)
              <SummaryArrow />
            </div>
          </Summary>
          {optionalFields}
        </details>
      )}
    </form>
  );
}
