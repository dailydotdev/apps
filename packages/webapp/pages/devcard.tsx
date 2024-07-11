import React, {
  ReactElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import Tilt from 'react-parallax-tilt';
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
} from '@dailydotdev/shared/src/components/buttons/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { useCopyLink } from '@dailydotdev/shared/src/hooks/useCopy';
import { ActiveTabIndicator } from '@dailydotdev/shared/src/components/utilities';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import DevCardPlaceholder from '@dailydotdev/shared/src/components/DevCardPlaceholder';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { devCard } from '@dailydotdev/shared/src/lib/constants';
import {
  DevCard,
  DevCardTheme,
  DevCardType,
  devcardTypeToEventFormat,
  requiredPoints,
  themeToLinearGradient,
} from '@dailydotdev/shared/src/components/profile/devcard';
import { WidgetContainer } from '@dailydotdev/shared/src/components/widgets/common';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import {
  useActions,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  DevCardQueryData,
  useDevCard,
} from '@dailydotdev/shared/src/hooks/profile/useDevCard';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { isNullOrUndefined } from '@dailydotdev/shared/src/lib/func';
import { downloadUrl } from '@dailydotdev/shared/src/lib/blob';
import { checkLowercaseEquality } from '@dailydotdev/shared/src/lib/strings';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { getLayout } from '../components/layouts/MainLayout';
import { defaultOpenGraph } from '../next-seo';
import { getTemplatedTitle } from '../components/layouts/utils';
import styles from '../components/layouts/ProfileLayout/NavBar.module.css';
import {
  DevCardMutation,
  GENERATE_DEVCARD_MUTATION,
  GenerateDevCardParams,
} from '../graphql/devcard';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';

interface Step1Props {
  onGenerateImage(url: string): void;
}

const Step1 = ({ onGenerateImage }: Step1Props): ReactElement => {
  const { user, showLogin, loadingUser } = useContext(AuthContext);
  const { mutateAsync: onGenerate, isLoading } = useMutation(
    () => gqlClient.request<DevCardMutation>(GENERATE_DEVCARD_MUTATION),
    {
      onSuccess: (data) => {
        const url = data?.devCard?.imageUrl;

        if (data?.devCard?.imageUrl) {
          onGenerateImage(url);
        }
      },
    },
  );

  return (
    <>
      <DevCardPlaceholder profileImage={user?.image} />
      <h1 className="mt-10 font-bold typo-title1">Generate your DevCard</h1>
      <p className="mt-4 max-w-[23.5rem] text-center text-text-secondary typo-callout">
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
              onClick={() => onGenerate()}
              loading={isLoading}
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
    </>
  );
};

interface Step2Props {
  initialDevCardSrc?: string;
}

const Step2 = ({ initialDevCardSrc }: Step2Props): ReactElement => {
  const [type, setType] = useState(DevCardType.Vertical);
  const { user } = useContext(AuthContext);
  const { devcard } = useDevCard(user?.id);
  const { theme, showBorder, isProfileCover } = devcard ?? {
    theme: DevCardTheme.Default,
    showBorder: true,
    isProfileCover: false,
  };
  const isMobile = useViewSize(ViewSize.MobileL);

  const randomStr = Math.random().toString(36).substring(2, 5);
  const [devCardSrc, setDevCardSrc] = useState<string>(
    initialDevCardSrc ??
      `${process.env.NEXT_PUBLIC_API_URL}/devcards/v2/${user.id}.png?type=default&r=${randomStr}`,
  );

  const client = useQueryClient();
  const { logEvent } = useLogContext();
  const key = useMemo(
    () => generateQueryKey(RequestKey.DevCard, { id: user?.id }),
    [user],
  );
  const embedCode = useMemo(
    () =>
      `<a href="https://app.daily.dev/${
        user?.username
      }"><img src="${devCardSrc}" width="${
        type === DevCardType.Horizontal ? 652 : 356
      }" alt="${user?.name}'s Dev Card"/></a>`,
    [user?.name, user?.username, devCardSrc, type],
  );
  const [copyingEmbed, copyEmbed] = useCopyLink(() => embedCode);
  const [selectedTab, setSelectedTab] = useState(0);
  const { mutateAsync: onDownloadUrl, isLoading: downloading } =
    useMutation(downloadUrl);

  const downloadImage = async (url?: string): Promise<void> => {
    const finalUrl = url ?? devCardSrc;
    await onDownloadUrl({ url: finalUrl, filename: `${user.username}.png` });
  };

  const { mutateAsync: onGenerate, isLoading } = useMutation(
    (params: Partial<GenerateDevCardParams> = {}) => {
      return gqlClient.request(GENERATE_DEVCARD_MUTATION, {
        ...params,
        theme: params?.theme?.toLocaleUpperCase() ?? 'DEFAULT',
        type: params?.type ?? 'DEFAULT',
      });
    },
    {
      onSuccess: (data, vars) => {
        if (!data?.devCard?.imageUrl || vars.type === DevCardType.Twitter) {
          return;
        }

        setDevCardSrc(data.devCard.imageUrl);
      },
    },
  );

  const onUpdatePreference = useCallback(
    (props: Partial<Omit<GenerateDevCardParams, 'type'>>) => {
      client.setQueryData(key, (oldData: DevCardQueryData) => {
        return {
          ...oldData,
          devCard: {
            ...oldData?.devCard,
            ...props,
          },
        };
      });
    },
    [key, client],
  );

  const onUpdateType = (newType: DevCardType) => {
    if (newType && newType !== type) {
      setType(newType);

      const url = new URL(devCardSrc);
      url.searchParams.set('type', newType.toLocaleLowerCase());
      setDevCardSrc(url.toString());
    }
  };

  const generateThenDownload = async (
    props: Partial<GenerateDevCardParams> = {},
  ) => {
    const params = { type, theme, showBorder, isProfileCover, ...props };
    const res = await onGenerate(params);
    const url = res?.devCard?.imageUrl;

    if (url) {
      if (!isMobile) {
        downloadImage(url);
      }
      logEvent({
        event_name: LogEvent.DownloadDevcard,
        extra: JSON.stringify({
          format: devcardTypeToEventFormat[type],
        }),
      });
    }
  };

  return (
    <div className="mt-14 flex max-w-full flex-col self-stretch mobileL:mx-2">
      <main className="flex max-w-full flex-wrap justify-center gap-10 laptopL:gap-20">
        <section className="align-center flex w-full flex-col laptopL:w-[37.5rem]">
          <h1 className="mx-3 mb-8 text-center font-bold typo-title1">
            Share your #DevCard!
          </h1>
          <div className="flex grow-0 flex-row justify-center">
            <RadioItem
              disabled={isLoading}
              name="vertical"
              checked={type === DevCardType.Vertical}
              onChange={() => onUpdateType(DevCardType.Vertical)}
            >
              Vertical
            </RadioItem>

            <RadioItem
              disabled={isLoading}
              name="horizontal"
              checked={type === DevCardType.Horizontal}
              onChange={() => onUpdateType(DevCardType.Horizontal)}
            >
              Horizontal
            </RadioItem>
          </div>

          <div
            className={classNames(
              'flex justify-center',
              type === DevCardType.Horizontal &&
                'mobileL:scale-60 mobileXXL:scale-80 scale-50 mobileXL:scale-75 tablet:scale-100',
            )}
          >
            {user && (
              <Tilt
                className="relative m-4 mt-8 w-fit self-stretch overflow-hidden rounded-32"
                glareEnable
                perspective={1000}
                glareMaxOpacity={0.25}
                glarePosition="all"
                trackOnWindow
                style={{ transformStyle: 'preserve-3d' }}
              >
                <DevCard userId={user.id} type={type} isInteractive={false} />
              </Tilt>
            )}
          </div>

          {!isNullOrUndefined(devcard) && (
            <Button
              className="mx-auto mt-4 grow-0 self-start"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              onClick={() => generateThenDownload({})}
              disabled={downloading || isLoading}
              tag={isMobile ? 'a' : 'button'}
              href={devCardSrc}
              target={isMobile ? '_blank' : undefined}
            >
              Download DevCard
            </Button>
          )}
        </section>

        <WidgetContainer className="flex max-w-[26.25rem] flex-1 flex-col mobileL:min-w-96">
          <div
            className={classNames(
              'sticky top-12 flex justify-around rounded-24 bg-background-default tablet:top-14 tablet:justify-start',
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

          <div className="flex flex-col gap-8 p-5">
            {selectedTab === 0 && (
              <>
                <p className="text-text-tertiary typo-callout">
                  Show off your daily.dev activity easily by adding your DevCard
                  to GitHub, your website, or use it as a dynamic Twitter cover
                  (now called X, but we still like the old name better).
                </p>

                <div>
                  <h3 className="typo-title4 flex font-bold">
                    <GitHubIcon className="mr-2" size={IconSize.Small} />
                    Embed the DevCard on your GitHub profile
                  </h3>

                  <p className="mt-2 inline-block text-text-tertiary typo-callout">
                    Find out how to put your DevCard in your GitHub README and
                    make it update automatically using GitHub Actions.{' '}
                    <ClickableText
                      tag="a"
                      defaultTypo={false}
                      href={`${devCard}?utm_source=webapp&utm_medium=devcard&utm_campaign=devcardguide&utm_id=inapp`}
                      className="!inline typo-subhead"
                      target="_blank"
                    >
                      Full tutorial{' '}
                      <OpenLinkIcon
                        className="mb-1 inline-block"
                        size={IconSize.XXSmall}
                      />
                    </ClickableText>
                  </p>

                  <p className="white-space-pre-wrap mt-4 break-words rounded-10 bg-surface-float px-4 py-2 text-text-tertiary">
                    {embedCode}
                  </p>
                  <Button
                    className="mt-4"
                    variant={ButtonVariant.Secondary}
                    size={ButtonSize.Small}
                    onClick={() => {
                      copyEmbed();
                      logEvent({
                        event_name: LogEvent.CopyDevcardCode,
                      });
                    }}
                  >
                    {!copyingEmbed ? 'Copy code' : 'Copied!'}
                  </Button>
                </div>

                <div>
                  <h3 className="typo-title4 flex font-bold">
                    <TwitterIcon size={IconSize.Small} className="mr-1.5" />
                    Use as X header
                  </h3>
                  <p className="mt-2 text-text-tertiary typo-callout">
                    Level up your Twitter game with a DevCard header image!
                  </p>
                  <Button
                    className="mt-5"
                    variant={ButtonVariant.Secondary}
                    size={ButtonSize.Small}
                    onClick={() =>
                      generateThenDownload({ type: DevCardType.Twitter })
                    }
                    disabled={downloading || isLoading}
                  >
                    Download X cover image
                  </Button>
                </div>
              </>
            )}

            {selectedTab === 1 && (
              <>
                <div>
                  <h3 className="typo-title4 mb-2 font-bold">Theme</h3>

                  <div className="flex flex-row flex-wrap">
                    {Object.keys(themeToLinearGradient).map((value) => {
                      const isLocked = user?.reputation < requiredPoints[value];
                      return (
                        <SimpleTooltip
                          key={value}
                          content={
                            isLocked ? (
                              `Earn ${requiredPoints[value]} reputation points to unlock ${value} theme`
                            ) : (
                              <span className="capitalize">{value}</span>
                            )
                          }
                        >
                          <span className="mb-3 mr-3">
                            <button
                              disabled={isLocked || isLoading}
                              type="button"
                              aria-label={`Select ${value} theme`}
                              className={classNames(
                                'h-10 w-10 rounded-full',
                                isLocked && 'opacity-32',
                                checkLowercaseEquality(theme, value) &&
                                  'border-4 border-accent-cabbage-default',
                              )}
                              style={{
                                background: themeToLinearGradient[value],
                              }}
                              onClick={() =>
                                onUpdatePreference({
                                  theme: value as DevCardTheme,
                                })
                              }
                            />
                          </span>
                        </SimpleTooltip>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="typo-title4 mb-2 font-bold">Cover image</h3>
                  <p className="text-text-tertiary typo-callout">
                    You can use our default image or update the image by editing
                    your profile
                  </p>

                  <RadioItem
                    disabled={isLoading}
                    name="defaultCover"
                    checked={!isProfileCover}
                    onChange={() =>
                      onUpdatePreference({ isProfileCover: false })
                    }
                    className={{ content: 'my-1.5 truncate' }}
                  >
                    Default
                  </RadioItem>

                  <RadioItem
                    disabled={isLoading || !user.cover}
                    name="profileCover"
                    checked={isProfileCover}
                    onChange={() =>
                      onUpdatePreference({ isProfileCover: true })
                    }
                    className={{ content: 'my-1.5 truncate' }}
                  >
                    Use profile cover
                  </RadioItem>
                </div>
                <div>
                  <h3 className="typo-title4 mb-2 font-bold">Profile image</h3>

                  <Switch
                    inputId="show-border"
                    className="my-3"
                    compact={false}
                    name="showBorder"
                    checked={showBorder}
                    onToggle={() =>
                      onUpdatePreference({ showBorder: !showBorder })
                    }
                  >
                    Show border
                  </Switch>
                </div>

                <Button
                  className="grow-0 self-start"
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Medium}
                  onClick={() =>
                    onGenerate({ theme, showBorder, isProfileCover, type })
                  }
                  loading={isLoading}
                >
                  Save
                </Button>
              </>
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
  const { completeAction, checkHasCompleted, isActionsFetched } = useActions();
  const { user, loadingUser } = useContext(AuthContext);
  const isDevCardGenerated = checkHasCompleted(ActionType.DevCardGenerate);
  const [devCardSrc, setDevCarSrc] = useState<string>();
  const { logEvent } = useLogContext();

  const onGenerateDevCard = (url: string) => {
    setDevCarSrc(url);
    completeAction(ActionType.DevCardGenerate);
    logEvent({
      event_name: LogEvent.GenerateDevcard,
    });
  };

  if ((loadingUser || user) && !isActionsFetched) {
    return null;
  }

  return (
    <div
      className={classNames(
        'page mx-auto flex min-h-page max-w-full flex-col items-center justify-center py-10 pb-20 mobileL:px-6 tablet:-mt-12 tablet:pb-10',
        isDevCardGenerated && 'laptop:flex-row laptop:gap-20',
      )}
    >
      <NextSeo {...seo} />
      {isDevCardGenerated ? (
        <Step2 initialDevCardSrc={devCardSrc} />
      ) : (
        <Step1 onGenerateImage={onGenerateDevCard} />
      )}
    </div>
  );
};

const getDevCardLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

DevCardPage.getLayout = getDevCardLayout;
DevCardPage.layoutProps = { screenCentered: false, canGoBack: true };

export default DevCardPage;
