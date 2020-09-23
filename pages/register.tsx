import React, {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useContext,
  useRef,
  useState,
} from 'react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import styled from 'styled-components';
import { format } from 'date-fns';
import { NextSeo } from 'next-seo';
import {
  changeProfileImage,
  getUserProps,
  updateProfile,
  UserProfile,
} from '../lib/user';
import { PageProps } from './_app';
import { shouldSkipSSR, SkipSSRProps } from '../lib/ssr';
import MainLayout from '../components/MainLayout';
import {
  typoDouble,
  typoLil2,
  typoMicro2,
  typoNuggets,
} from '../styles/typography';
import {
  size05,
  size10,
  size2,
  size3,
  size4,
  size5,
  size6,
  sizeN,
} from '../styles/sizes';
import { PageContainer } from '../components/utilities';
import { colorKetchup30, colorPepper80 } from '../styles/colors';
import ArrowIcon from '../icons/arrow.svg';
import CameraIcon from '../icons/camera.svg';
import GitHubIcon from '../icons/github.svg';
import GoogleIcon from '../icons/google.svg';
import TextField from '../components/TextField';
import Switch from '../components/Switch';
import { HollowButton, InvertButton } from '../components/Buttons';
import AuthContext from '../components/AuthContext';
import { focusOutline } from '../styles/utilities';
import { useRouter } from 'next/router';

export async function getServerSideProps({
  query,
  req,
  res,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<PageProps | SkipSSRProps>
> {
  if (shouldSkipSSR(query)) {
    return { props: { skipSSR: true } };
  }
  const userProps = await getUserProps({ req, res });
  if (!userProps.user) {
    res.statusCode = 302;
    res.setHeader('Location', '/');
    return { props: { skipSSR: true } };
  }

  return {
    props: {
      ...userProps,
      user: userProps.user,
      initialApolloState: null,
    },
  };
}

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

const ImageAndMetadata = styled.div`
  display: flex;
  margin-top: ${size6};
  align-items: center;
`;

const ImageInputHover = styled.span`
  position: absolute;
  display: flex;
  visibility: hidden;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background: ${colorPepper80}66;
  opacity: 0;
  transition: opacity 0.1s linear;

  .icon {
    font-size: ${sizeN(11)};
  }
`;

const ImageInput = styled.label`
  position: relative;
  overflow: hidden;
  width: ${sizeN(25)};
  height: ${sizeN(25)};
  border-radius: ${size4};
  cursor: pointer;

  input {
    display: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover ${ImageInputHover} {
    visibility: visible;
    opacity: 1;
  }
`;

const Metadata = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${size6};
  color: var(--theme-secondary);
  ${typoMicro2}

  div {
    display: flex;
    align-items: center;
    margin: ${size05} 0;
  }

  .icon {
    font-size: ${size4};
    margin-right: ${size3};
  }
`;

const ErrorMessage = styled.div.attrs({ role: 'alert' })`
  margin-top: ${size4};
  color: ${colorKetchup30};
  ${typoMicro2}
`;

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

const FormSwitch = styled(Switch)`
  margin: ${size3} 0;
`;

const LogoutButton = styled(HollowButton)`
  margin-right: ${size4};
  padding: ${size2} ${size4};
  border-radius: ${size2};
  ${typoLil2}
`;

const FormButtons = styled.div`
  display: flex;
  margin-top: ${size10};
  align-items: center;
  align-self: stretch;

  ${InvertButton} {
    flex: 1;
  }
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

const FormSectionHeading = styled.h3`
  margin: 0 0 ${size4};
  color: var(--theme-secondary);
  ${typoNuggets}

  ${OptionalSummary} ~ & {
    margin-top: ${size3};
  }

  ${FormField} ~ & {
    margin-top: ${size10};
  }
`;

const TWO_MEGABYTES = 2 * 1024 * 1024;
const defaultEmailHint = 'Not publicly shared';

export default function Register(): ReactElement {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(user.image);
  const [imageError, setImageError] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);
  const [usernameHint, setUsernameHint] = useState<string>();
  const [twitterHint, setTwitterHint] = useState<string>();
  const [githubHint, setGithubHint] = useState<string>();
  const [emailHint, setEmailHint] = useState(defaultEmailHint);

  const formRef = useRef<HTMLFormElement>(null);

  const updateDisableSubmit = () => {
    if (formRef.current) {
      setDisableSubmit(!formRef.current.checkValidity());
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

  const onFileChange = async (event: ChangeEvent) => {
    const input = event.target as HTMLInputElement;
    const file = input.files[0];
    if (file.size > TWO_MEGABYTES) {
      setImageError(true);
      return;
    }

    setImageError(false);
    const reader = new FileReader();
    reader.onload = (readerEvent) =>
      setProfileImage(readerEvent.target.result as string);
    reader.readAsDataURL(file);
    try {
      const newUser = await changeProfileImage(file);
      setProfileImage(newUser.image);
    } catch (err) {
      console.error('failed to change profile image', err);
      setProfileImage(user.image);
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
      setDisableSubmit(false);
      await router.replace((router.query.redirect_uri as string) || '/');
    }
  };

  return (
    <MainLayout showOnlyLogo={true}>
      <NextSeo title="Registration" />
      <PageContainer>
        <Heading>Set up your profile</Heading>
        <Subheading>Please fill in your details below</Subheading>
        <ImageAndMetadata>
          <ImageInput title="Change your profile image">
            <input
              type="file"
              name="profileImage"
              id="profileImage"
              data-testid="profileImage"
              accept="image/png,image/jpeg"
              onChange={onFileChange}
            />
            <img src={profileImage} alt="Your profile image" />
            <ImageInputHover>
              <CameraIcon />
            </ImageInputHover>
          </ImageInput>
          <Metadata>
            {user?.providers[0] === 'google' ? (
              <div>
                <GoogleIcon />
                <span>via Google</span>
              </div>
            ) : (
              <div>
                <GitHubIcon />
                <span>via GitHub</span>
              </div>
            )}
            <div>
              Joined&nbsp;
              <time dateTime={user.createdAt}>
                {format(new Date(user.createdAt), 'MMMM y')}
              </time>
            </div>
          </Metadata>
        </ImageAndMetadata>
        {imageError && <ErrorMessage>Maximum image size is 2 MB</ErrorMessage>}
        <Form ref={formRef}>
          <FormSectionHeading>Profile</FormSectionHeading>
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
          <FormSwitch
            name="acceptedMarketing"
            inputId="acceptedMarketing"
            checked={user.acceptedMarketing}
          >
            Subscribe to the Weekly Recap
          </FormSwitch>
          <OptionalFields>
            <OptionalSummary>
              More details (optional)
              <ArrowIcon />
            </OptionalSummary>
            <FormSectionHeading>About</FormSectionHeading>
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
            <FormSectionHeading>Social</FormSectionHeading>
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
          </OptionalFields>
          <FormButtons>
            <LogoutButton type="button" onClick={logout}>
              Logout
            </LogoutButton>
            <InvertButton
              type="submit"
              disabled={disableSubmit}
              onClick={submitForm}
            >
              Finish
            </InvertButton>
          </FormButtons>
        </Form>
      </PageContainer>
    </MainLayout>
  );
}
