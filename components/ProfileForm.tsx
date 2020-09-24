import React, {
  FormEvent,
  HTMLAttributes,
  ReactElement,
  useContext,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { updateProfile, UserProfile } from '../lib/user';
import { size1, size10, size3, size4, size5 } from '../styles/sizes';
import { typoNuggets } from '../styles/typography';
import { focusOutline } from '../styles/utilities';
import TextField from './TextField';
import Switch from './Switch';
import ArrowIcon from '../icons/arrow.svg';
import AuthContext from './AuthContext';

export interface ProfileForm extends HTMLAttributes<HTMLFormElement> {
  setDisableSubmit?: (disable: boolean) => void;
  onSuccessfulSubmit?: () => void | Promise<void>;
  updateMode?: boolean;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: ${size10} 0 0;
  padding: 0;
`;

const FormField = styled(TextField)`
  align-self: stretch;
  margin-bottom: ${size3};
`;

const OptionalSummary = styled.summary`
  display: flex;
  height: ${size10};
  align-items: center;
  color: var(--theme-primary);
  cursor: pointer;
  ${typoNuggets}
  ${focusOutline}

  &::-webkit-details-marker {
    display: none;
  }

  & .icon {
    margin-left: auto;
    font-size: ${size5};
    transform: rotate(90deg);
    transition: transform 0.1s linear;
  }
`;

const OptionalFields = styled.details`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-bottom: 0.063rem solid var(--theme-separator);

  &[open] {
    padding-bottom: ${size3};

    ${OptionalSummary} .icon {
      transform: rotate(180deg);
    }
  }
`;

const SectionHeading = styled.h3`
  margin: 0 0 ${size4};
  color: var(--theme-secondary);
  ${typoNuggets}

  ${OptionalSummary} + & {
    margin-top: ${size3};
  }

  /* stylelint-disable-next-line no-duplicate-selectors */
  ${FormField} + & {
    margin-top: ${size10};
  }
`;

const FormSwitch = styled(Switch)`
  margin: ${size3} 0;

  ${SectionHeading} + & {
    margin-top: -${size1};
  }
`;

const defaultEmailHint = 'Not publicly shared';

export default function ProfileForm({
  setDisableSubmit,
  onSuccessfulSubmit,
  updateMode,
  ...props
}: ProfileForm): ReactElement {
  const { user, updateUser } = useContext(AuthContext);

  const formRef = useRef<HTMLFormElement>(null);

  const [usernameHint, setUsernameHint] = useState<string>();
  const [twitterHint, setTwitterHint] = useState<string>();
  const [githubHint, setGithubHint] = useState<string>();
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
    const data: UserProfile = Array.from(formRef.current.elements).reduce(
      (acc, val: HTMLInputElement) => {
        if (val.name === '') {
          return acc;
        }
        if (val.type === 'checkbox') {
          return { ...acc, [val.name]: val.checked };
        }
        return {
          ...acc,
          [val.name]: val.value.length ? val.value : null,
        };
      },
      { name: '', email: '', username: '' },
    );

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
        }
      }
    } else {
      updateUser({ ...user, ...res });
      setDisableSubmit?.(false);
      onSuccessfulSubmit?.();
    }
  };

  const optionalFields = (
    <>
      <SectionHeading>About</SectionHeading>
      <FormField
        inputId="bio"
        name="bio"
        label="Bio"
        value={user.bio}
        maxLength={160}
        validityChanged={updateDisableSubmit}
      />
      <FormField
        inputId="company"
        name="company"
        label="Company"
        value={user.company}
        maxLength={50}
        validityChanged={updateDisableSubmit}
      />
      <FormField
        inputId="title"
        name="title"
        label="Job title"
        value={user.title}
        maxLength={50}
        validityChanged={updateDisableSubmit}
      />
      <SectionHeading>Social</SectionHeading>
      <FormField
        inputId="twitter"
        name="twitter"
        label="Twitter"
        value={user.twitter}
        hint={twitterHint}
        valid={!twitterHint}
        maxLength={15}
        validityChanged={updateDisableSubmit}
        valueChanged={() => twitterHint && setTwitterHint(null)}
      />
      <FormField
        inputId="github"
        name="github"
        label="GitHub"
        value={user.github}
        hint={githubHint}
        valid={!githubHint}
        maxLength={39}
        validityChanged={updateDisableSubmit}
        valueChanged={() => githubHint && setGithubHint(null)}
      />
      <FormField
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
        inputId="name"
        name="name"
        label="Name"
        value={user.name}
        required
        maxLength={50}
        validityChanged={updateDisableSubmit}
      />
      <FormField
        inputId="username"
        name="username"
        label="Username"
        value={user.username}
        required
        hint={usernameHint}
        valid={!usernameHint}
        validityChanged={usernameValidityUpdated}
        maxLength={15}
        pattern="(\w){1,15}"
        valueChanged={() => usernameHint && setUsernameHint(null)}
      />
      <FormField
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
      {updateMode && (
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
      {!updateMode && (
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
