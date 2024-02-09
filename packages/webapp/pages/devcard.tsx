import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  GitHubIcon,
  OpenLinkIcon,
  TwitterIcon,
} from '@dailydotdev/shared/src/components/icons';
import { RadioItem } from '@dailydotdev/shared/src/components/fields/RadioItem';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import request from 'graphql-request';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { useCopyLink } from '@dailydotdev/shared/src/hooks/useCopy';
import {
  ActiveTabIndicator,
  FormErrorMessage,
} from '@dailydotdev/shared/src/components/utilities';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import DevCardPlaceholder from '@dailydotdev/shared/src/components/DevCardPlaceholder';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { labels } from '@dailydotdev/shared/src/lib';
import {
  DevCard,
  DevCardType,
  themeToLinearGradient,
} from '@dailydotdev/shared/src/components/profile/devcard';
import { WidgetContainer } from '@dailydotdev/shared/src/components/widgets/common';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { useActions } from '@dailydotdev/shared/src/hooks';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { DevCardData, GENERATE_DEVCARD_MUTATION } from '../graphql/devcard';
import { getLayout as getMainLayout } from '../components/layouts/MainLayout';
import { defaultOpenGraph } from '../next-seo';
import { getTemplatedTitle } from '../components/layouts/utils';
import styles from '../components/layouts/ProfileLayout/NavBar.module.css';

interface GenerateDevCardParams {
  theme?: string;
  type?: string;
  isProfileCover?: boolean;
  showBorder?: boolean;
}

type StepProps = {
  onGenerateImage: (params?: GenerateDevCardParams) => unknown;
  devCardSrc?: string;
  isLoadingImage: boolean;
  error?: string;
};

const Step1 = ({
  onGenerateImage,
  isLoadingImage,
  error,
}: StepProps): ReactElement => {
  const { user, showLogin, loadingUser } = useContext(AuthContext);

  return (
    <>
      <DevCardPlaceholder profileImage={user?.image} />
      <h1 className="mt-10 font-bold typo-title1">Generate your DevCard</h1>
      <p className="mt-4 max-w-[23.5rem] text-center text-theme-label-secondary typo-callout">
        Flexing is fun, and doing it with a DevCard takes it to the next level.
        Generate a DevCard to showcase your activity on daily.dev, including
        your reading habits, top topics, and more.
      </p>
      <div className="mt-10 h-12">
        {!loadingUser &&
          (user ? (
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              onClick={() => onGenerateImage()}
              loading={isLoadingImage}
            >
              Generate now
            </Button>
          ) : (
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Large}
              onClick={() => showLogin({ trigger: AuthTriggers.DevCard })}
            >
              Login to generate
            </Button>
          ))}
      </div>
      {error && <FormErrorMessage role="alert">{error}</FormErrorMessage>}
    </>
  );
};

const Step2 = ({
  onGenerateImage,
  devCardSrc,
  isLoadingImage,
  error,
}: StepProps): ReactElement => {
  const { user } = useContext(AuthContext);
  const embedCode = useMemo(
    () =>
      `<a href="https://app.daily.dev/${user?.username}"><img src="${devCardSrc}" width="400" alt="${user?.name}'s Dev Card"/></a>`,
    [user?.name, user?.username, devCardSrc],
  );
  const [copyingEmbed, copyEmbed] = useCopyLink(() => embedCode);
  const [downloading, setDownloading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [cardType, setCardType] = useState(DevCardType.Vertical);
  const [profileCover, setProfileCover] = useState(true);
  const [showBorder, setShowBorder] = useState(true);

  const downloadImage = async (): Promise<void> => {
    setDownloading(true);
    const image = await fetch(devCardSrc);
    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);

    const link = document.createElement('a');
    link.href = imageURL;
    link.download = `${user.username}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloading(false);
  };

  const finalError = error;

  useEffect(() => {
    onGenerateImage({
      type: cardType === DevCardType.Vertical ? 'DEFAULT' : 'WIDE',
      isProfileCover: profileCover,
      showBorder,
    });
  }, [onGenerateImage, cardType, profileCover, showBorder]);

  return (
    <div className="mx-2 mt-14 flex flex-col self-stretch">
      <main className="z-2 flex flex-col gap-10 laptop:flex-row laptopL:gap-20">
        <section className="align-center flex w-full flex-1 flex-col">
          <h1 className="mx-3 mb-8 text-center font-bold typo-title1">
            Share your #DevCard!
          </h1>
          <div className="flex grow-0 flex-row justify-center">
            <RadioItem
              disabled={isLoadingImage}
              name="vertical"
              checked={cardType === DevCardType.Vertical}
              onChange={() => setCardType(DevCardType.Vertical)}
            >
              Vertical
            </RadioItem>

            <RadioItem
              disabled={isLoadingImage}
              name="horizontal"
              checked={cardType === DevCardType.Horizontal}
              onChange={() => setCardType(DevCardType.Horizontal)}
            >
              Horizontal
            </RadioItem>
          </div>

          <div>{user && <DevCard userId={user.id} type={cardType} />}</div>

          <Button
            className="mt-4 grow-0 self-start"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            onClick={downloadImage}
            loading={downloading}
          >
            Download DevCard
          </Button>
        </section>

        <WidgetContainer className="flex w-full max-w-[26.5rem] flex-col self-stretch">
          <div
            className={classNames(
              'sticky top-12 flex justify-around tablet:top-14 tablet:justify-start',
              styles.nav,
            )}
          >
            <div className="p-2">
              <Button
                size={ButtonSize.Medium}
                pressed={selectedTab === 0}
                variant={ButtonVariant.Tertiary}
                onClick={() => setSelectedTab(0)}
              >
                Embed
              </Button>

              {selectedTab === 0 && (
                <ActiveTabIndicator className="bottom-0 w-10" />
              )}
            </div>

            <div className="p-2">
              <Button
                size={ButtonSize.Medium}
                pressed={selectedTab === 1}
                variant={ButtonVariant.Tertiary}
                onClick={() => setSelectedTab(1)}
              >
                Customize
              </Button>

              {selectedTab === 1 && (
                <ActiveTabIndicator className="bottom-0 w-14" />
              )}
            </div>
          </div>

          <div className="grid gap-8 p-5">
            {selectedTab === 0 && (
              <>
                <p className="text-theme-label-tertiary typo-callout">
                  Show off your daily.dev activity easily by adding your DevCard
                  to GitHub, your website, or use it as a dynamic Twitter cover
                  (now called X, but we still like the old name better).
                </p>

                <div>
                  <h3 className="typo-title4 flex font-bold">
                    <GitHubIcon className="mr-2" size={IconSize.Small} />
                    Embed the DevCard on your GitHub profile
                  </h3>

                  <p className="mt-2 text-theme-label-tertiary typo-callout">
                    Find out how to put your DevCard in your GitHub README and
                    make it update automatically using GitHub Actions.{' '}
                    <a href="..TODO.." className="inline-block typo-subhead">
                      Full tutorial{' '}
                      <OpenLinkIcon
                        className="mb-1 inline-block"
                        size={IconSize.XXSmall}
                      />
                    </a>
                  </p>

                  <textarea
                    className="mt-4 h-[7.75rem] w-full resize-none self-stretch rounded-10 bg-theme-float px-4 py-2 text-theme-label-tertiary laptopL:w-[25rem]"
                    readOnly
                    wrap="hard"
                    value={embedCode}
                  />
                  <Button
                    className="mt-2"
                    variant={ButtonVariant.Secondary}
                    size={ButtonSize.Small}
                    onClick={() => copyEmbed()}
                  >
                    {!copyingEmbed ? 'Copy code' : 'Copied!'}
                  </Button>
                </div>

                <div>
                  <span>
                    <TwitterIcon size={IconSize.Small} />
                    <h3 className="typo-title4 inline-box mr-2 font-bold">
                      Use as X header
                    </h3>
                  </span>
                  <p className="mt-2 text-theme-label-tertiary typo-callout">
                    Level up your Twitter game with a DevCard header image!
                  </p>
                </div>
              </>
            )}

            {selectedTab === 1 && (
              <>
                <h3 className="typo-title4 mb-2 font-bold">Theme</h3>

                <div className="flex flex-row flex-wrap">
                  {Object.keys(themeToLinearGradient).map((theme) => (
                    <>
                      <div
                        className="mb-3 mr-3 h-10 w-10 rounded-full"
                        style={{ background: themeToLinearGradient[theme] }}
                      />
                    </>
                  ))}
                </div>
                <h3 className="typo-title4 mb-2 mt-5 font-bold">Cover image</h3>
                <p className="text-theme-label-tertiary typo-callout">
                  You can use our default image or update the image by editing
                  your profile
                </p>

                <RadioItem
                  disabled={isLoadingImage}
                  name="defaultCover"
                  checked={!profileCover}
                  onChange={() => setProfileCover(false)}
                  className="my-1.5 truncate"
                >
                  Default
                </RadioItem>

                <RadioItem
                  disabled={isLoadingImage}
                  name="profileCover"
                  checked={profileCover}
                  onChange={() => setProfileCover(true)}
                  className="my-1.5 truncate"
                >
                  Use profile cover
                </RadioItem>

                <h3 className="typo-title4 mb-2 mt-5 font-bold">
                  Profile image
                </h3>

                <Switch
                  inputId="show-border"
                  className="my-3"
                  compact={false}
                  name="showBorder"
                  checked={showBorder}
                  onToggle={() => setShowBorder(!showBorder)}
                >
                  Show border
                </Switch>
              </>
            )}

            {finalError && (
              <FormErrorMessage role="alert">{finalError}</FormErrorMessage>
            )}
          </div>
        </WidgetContainer>
      </main>
    </div>
  );
};

const seo: NextSeoProps = {
  title: getTemplatedTitle('Grab your DevCard'),
  description:
    'DevCard will show you stats about the publications and topics you love to read. Generate yours now.',
  openGraph: {
    ...defaultOpenGraph,
    type: 'website',
    site_name: 'daily.dev',
  },
};

const DevCardPage = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [devCardSrc, setDevCardSrc] = useState<string>();
  const [imageError, setImageError] = useState<string>();
  const { completeAction, checkHasCompleted } = useActions();
  const isDevCardGenerated = checkHasCompleted(ActionType.DevCardGenerate);

  const onError = () => {
    setImageError(labels.error.generic);
    setIsLoadingImage(false);
  };

  const { mutateAsync: generateDevCard } = useMutation(
    ({ theme, type, isProfileCover, showBorder }: GenerateDevCardParams = {}) =>
      request(graphqlUrl, GENERATE_DEVCARD_MUTATION, {
        theme,
        type,
        isProfileCover,
        showBorder,
      }),
    {
      onMutate({ theme, isProfileCover, showBorder }) {
        const devCardQueryKey = generateQueryKey(RequestKey.DevCard, {
          id: user.id,
        });

        queryClient.setQueryData(devCardQueryKey, (oldData: DevCardData) => {
          if (oldData) {
            return { ...oldData, theme, showBorder, isProfileCover };
          }

          return null;
        });
      },
      onSuccess({ devCard }) {
        const img = new Image();
        const { imageUrl } = devCard;
        img.src = imageUrl;
        img.onload = () => {
          setDevCardSrc(imageUrl);
          setIsLoadingImage(false);
          completeAction(ActionType.DevCardGenerate);
        };
        img.onerror = onError;
      },
      onError,
    },
  );

  const stepProps: StepProps = {
    onGenerateImage: generateDevCard,
    devCardSrc,
    isLoadingImage,
    error: imageError,
  };
  return (
    <div
      className={classNames(
        'page mx-auto flex min-h-page max-w-full flex-col items-center justify-center px-6 py-10 tablet:-mt-12',
        isDevCardGenerated && 'laptop:flex-row laptop:gap-20',
      )}
    >
      <NextSeo {...seo} />
      {isDevCardGenerated ? <Step2 {...stepProps} /> : <Step1 {...stepProps} />}
    </div>
  );
};

DevCardPage.getLayout = getMainLayout;
DevCardPage.layoutProps = { screenCentered: false };

export default DevCardPage;
