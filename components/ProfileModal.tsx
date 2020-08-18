import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
  MouseEvent,
} from 'react';
import styled from 'styled-components';
import {
  ModalCloseButton,
  Props as ModalProps,
  StyledModal,
} from './StyledModal';
import {
  size2,
  size3,
  size4,
  size5,
  size6,
  size8,
  sizeN,
} from '../styles/sizes';
import XIcon from '../icons/x.svg';
import { typoDouble, typoMicro2 } from '../styles/typography';
import GitHubIcon from '../icons/github.svg';
import GoogleIcon from '../icons/google.svg';
import AuthContext from './AuthContext';
import TextField from './TextField';
import LazyImage from './LazyImage';
import { FloatButton, InvertButton } from './Buttons';
import { LoggedUser, updateProfile, UserProfile } from '../lib/user';
import { LegalNotice } from './utilities';
import { privacyPolicy, termsOfService } from '../lib/constants';
import Switch from './Switch';

const MyModal = styled(StyledModal)`
  .Modal {
    padding: ${size8} ${size4};
  }

  ${LegalNotice} {
    margin-top: ${size6};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0;
  padding: 0;
`;

const Heading = styled.h1`
  margin: 0;
  align-self: flex-start;
  text-transform: uppercase;
  ${typoDouble}
`;

const Subheading = styled.h2`
  margin: ${size2} 0;
  align-self: flex-start;
  color: var(--theme-secondary);
  ${typoMicro2}
`;

const Provider = styled.div`
  display: flex;
  align-items: center;
  align-self: flex-end;
  margin: ${size4} 0 ${size3};
  color: var(--theme-disabled);
  ${typoMicro2}

  .icon {
    margin-right: ${size3};
  }
`;

const ProfileImage = styled(LazyImage)`
  width: ${sizeN(14)};
  height: ${sizeN(14)};
  margin-right: ${size4};
  border-radius: ${size2};
`;

const AccountField = styled(TextField)`
  align-self: stretch;
  margin-bottom: ${({ saveHintSpace }) => (saveHintSpace ? size4 : size3)};
`;

const FirstRow = styled.div`
  display: flex;
  align-items: center;
  align-self: stretch;
  margin-bottom: ${size3};

  ${AccountField} {
    flex: 1;
    margin-bottom: 0;
  }
`;

const LogoutButton = styled(FloatButton)`
  margin-left: ${size6};
  padding: ${size2} ${size4};
`;

const Buttons = styled.div`
  display: flex;
  margin-top: ${size3};
  align-items: center;
  align-self: stretch;

  ${InvertButton} {
    flex: 1;
  }
`;

const FormSwitch = styled(Switch)`
  margin: ${size3} 0 ${size5};
`;

export interface Props extends ModalProps {
  confirmMode: boolean;
  profiledUpdated?: (user: LoggedUser) => void;
}

export default function ProfileModal(props: Props): ReactElement {
  // eslint-disable-next-line react/prop-types
  const { onRequestClose, confirmMode } = props;
  const { user, logout } = useContext(AuthContext);

  const formRef = useRef<HTMLFormElement>(null);
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);
  const [emailHint, setEmailHint] = useState<string>(undefined);

  const updateDisableSubmit = () => {
    if (formRef.current) {
      setDisableSubmit(!formRef.current.checkValidity());
    }
  };

  const submitForm = async (event: MouseEvent): Promise<void> => {
    event.preventDefault();
    setDisableSubmit(true);
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
      { name: '', email: '' },
    );

    const res = await updateProfile(data);
    if ('error' in res) {
      setEmailHint('This email already exists');
    } else {
      setDisableSubmit(false);
      if (props.profiledUpdated) {
        props.profiledUpdated(res);
      }
    }
  };

  useEffect(updateDisableSubmit, []);

  return (
    <MyModal {...props}>
      <ModalCloseButton onClick={onRequestClose}>
        <XIcon />
      </ModalCloseButton>
      <Form ref={formRef}>
        <Heading>{confirmMode ? 'Account details' : ' Your profile'}</Heading>
        <Subheading>
          {confirmMode
            ? 'Please confirm your details below'
            : ' Edit your profile details'}
        </Subheading>
        {user?.providers[0] === 'google' ? (
          <Provider>
            <GoogleIcon />
            <span>via Google</span>
          </Provider>
        ) : (
          <Provider>
            <GitHubIcon />
            <span>via GitHub</span>
          </Provider>
        )}
        <FirstRow>
          <ProfileImage imgSrc={user.image} imgAlt="Your profile image" />
          <AccountField
            inputId="name"
            name="name"
            label="Name"
            value={user.name}
            required
            maxLength={50}
            validityChanged={updateDisableSubmit}
          />
        </FirstRow>
        <AccountField
          inputId="email"
          name="email"
          label="Email"
          type="email"
          value={user.email}
          required
          saveHintSpace
          hint={emailHint}
          valid={!emailHint}
          validityChanged={updateDisableSubmit}
          valueChanged={() => emailHint && setEmailHint(undefined)}
        />
        <AccountField
          inputId="company"
          name="company"
          label="Company"
          value={user.company}
          validityChanged={updateDisableSubmit}
        />
        <AccountField
          inputId="title"
          name="title"
          label="Job title"
          value={user.title}
          validityChanged={updateDisableSubmit}
        />
        <FormSwitch
          name="acceptedMarketing"
          inputId="acceptedMarketing"
          checked={user.acceptedMarketing}
        >
          Subscribe to the Weekly Recap
        </FormSwitch>
        <Buttons>
          <InvertButton
            type="submit"
            disabled={disableSubmit}
            onClick={submitForm}
          >
            {confirmMode ? 'Confirm' : 'Save changes'}
          </InvertButton>
          {!confirmMode && (
            <LogoutButton type="button" onClick={logout}>
              Logout
            </LogoutButton>
          )}
        </Buttons>
      </Form>
      {!confirmMode && (
        <LegalNotice>
          <a href={termsOfService} target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href={privacyPolicy} target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
        </LegalNotice>
      )}
    </MyModal>
  );
}
