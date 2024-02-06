import React, {
  ChangeEvent,
  ReactElement,
  useContext,
  useRef,
  useState,
} from 'react';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { GitHubIcon } from '@dailydotdev/shared/src/components/icons';
import { RadioItem } from '@dailydotdev/shared/src/components/fields/RadioItem';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import { LoaderOverlay } from '@dailydotdev/shared/src/components/LoaderOverlay';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import request from 'graphql-request';
import { useMutation } from '@tanstack/react-query';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import classNames from 'classnames';
import { useCopyLink } from '@dailydotdev/shared/src/hooks/useCopy';
import { FormErrorMessage } from '@dailydotdev/shared/src/components/utilities';
import Tilt from 'react-parallax-tilt';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import DevCardPlaceholder from '@dailydotdev/shared/src/components/DevCardPlaceholder';
import useReadingRank from '@dailydotdev/shared/src/hooks/useReadingRank';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { devCard } from '@dailydotdev/shared/src/lib/constants';
import { labels } from '@dailydotdev/shared/src/lib';
import { useActions } from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { DevCardData, GENERATE_DEVCARD_MUTATION } from '../graphql/devcard';
import { getLayout as getMainLayout } from '../components/layouts/MainLayout';
import { defaultOpenGraph } from '../next-seo';
import { getTemplatedTitle } from '../components/layouts/utils';

const TWO_MEGABYTES = 2 * 1024 * 1024;

interface GenerateDevCardParams {
  file?: File;
  url?: string;
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
  const { rank } = useReadingRank();

  return (
    <>
      <DevCardPlaceholder
        profileImage={user?.image}
        rank={rank}
        isLocked={!user}
        width={108}
      />
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

const CUSTOM_BG = 'CUSTOM_BG';
const BY_RANK_BG = 'BY_RANK_BG';

// This can be used for themed devCards
const bgUrlOption = [];

const Step2 = ({
  onGenerateImage,
  devCardSrc,
  isLoadingImage,
  error,
}: StepProps): ReactElement => {
  const { user } = useContext(AuthContext);
  const inputRef = useRef<HTMLInputElement>();
  const [backgroundImageError, setBackgroundImageError] = useState<string>();
  const embedCode = `<a href="https://app.daily.dev/${user?.username}"><img src="${devCardSrc}" width="400" alt="${user?.name}'s Dev Card"/></a>`;
  const [copyingEmbed, copyEmbed] = useCopyLink(() => embedCode);
  const [copyingLink, copyLink] = useCopyLink(() => devCardSrc);
  const [downloading, setDownloading] = useState(false);
  const [bg, setBg] = useState(BY_RANK_BG);

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

  const onFileChange = (event: ChangeEvent) => {
    const input = event.target as HTMLInputElement;
    const file = input.files[0];
    if (file.size > TWO_MEGABYTES) {
      setBackgroundImageError('Maximum image size is 2 MB');
      return;
    }

    setBackgroundImageError(null);
    onGenerateImage({ file });
  };

  const onByRankClick = () => {
    setBg(BY_RANK_BG);
    onGenerateImage();
  };

  const onOptionChange = async (option: string) => {
    setBg(option);
    onGenerateImage({ url: option });
  };

  const onCustomClick = () => {
    setBg(CUSTOM_BG);
    inputRef.current.click();
  };

  const finalError = error || backgroundImageError;

  return (
    <div className="mx-2 mt-5 flex flex-col self-stretch laptop:self-center">
      <h1 className="mx-3 mb-8 font-bold typo-title1">Share your #DevCard</h1>
      <main className="z-2 flex flex-col gap-10 laptop:flex-row laptopL:gap-20">
        <section className="flex flex-col">
          <Tilt
            className="relative w-fit self-stretch overflow-hidden"
            glareEnable
            perspective={1000}
            glareMaxOpacity={0.25}
            glarePosition="all"
            trackOnWindow
            style={{ transformStyle: 'preserve-3d', borderRadius: '2rem' }}
            aria-busy={isLoadingImage}
          >
            <LazyImage
              imgSrc={devCardSrc}
              imgAlt="Your Dev Card"
              className="h-[25rem] w-72"
              eager
            />
            {isLoadingImage && <LoaderOverlay invertColor />}
          </Tilt>
          <div className="mx-2 mt-8 grid grid-cols-2 gap-4">
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              onClick={downloadImage}
              loading={downloading}
            >
              Download
            </Button>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Large}
              onClick={() => copyLink()}
            >
              {!copyingLink ? 'Copy link' : 'Copied!'}
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            name="backgroundImage"
            data-testid="backgroundImage"
            accept="image/png,image/jpeg"
            onChange={onFileChange}
            className="hidden"
          />
        </section>
        <section className="flex flex-col self-stretch text-theme-label-tertiary">
          <h2 className="font-bold typo-body">Customize Style</h2>
          <div className={classNames('-my-0.5 mt-8 flex flex-col items-start')}>
            <RadioItem
              disabled={isLoadingImage}
              name="timeOff"
              value={BY_RANK_BG}
              checked={bg === BY_RANK_BG}
              onChange={onByRankClick}
              className="my-0.5 truncate"
            >
              By rank
            </RadioItem>
            {bgUrlOption.map((option) => (
              <RadioItem
                disabled={isLoadingImage}
                key={option.value}
                name="timeOff"
                value={option.value}
                checked={bg === option.value}
                onChange={() => onOptionChange(option.value)}
                className="my-0.5 truncate"
              >
                {option.label}
                {option.caption && (
                  <span
                    className={classNames(
                      'ml-2 typo-caption2',
                      option.caption.className,
                    )}
                  >
                    {option.caption.text}
                  </span>
                )}
              </RadioItem>
            ))}
            <RadioItem
              disabled={isLoadingImage}
              name="timeOff"
              value={CUSTOM_BG}
              checked={bg === CUSTOM_BG}
              onChange={onCustomClick}
              className="my-0.5 truncate"
            >
              Custom
            </RadioItem>
          </div>
          {finalError && (
            <FormErrorMessage role="alert">{finalError}</FormErrorMessage>
          )}
          <div className="mt-10 flex flex-col items-start self-stretch">
            <h4 className="mt-1 font-bold typo-caption1">Embed</h4>
            <textarea
              className="mt-1 h-[7.75rem] w-80 resize-none self-stretch rounded-10 bg-theme-float px-4 py-2 typo-body laptopL:w-[25rem]"
              readOnly
              wrap="hard"
            >
              {embedCode}
            </textarea>
            <Button
              className="mt-4"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              onClick={() => copyEmbed()}
            >
              {!copyingEmbed ? 'Copy code' : 'Copied!'}
            </Button>
            <ClickableText
              tag="a"
              href={`${devCard}?utm_source=webapp&utm_medium=devcard&utm_campaign=devcardguide&utm_id=inapp`}
              className="mt-6 typo-body"
              defaultTypo={false}
              target="_blank"
            >
              <GitHubIcon className="mr-2 h-auto w-auto" />
              Add DevCard to your GitHub profile
            </ClickableText>
          </div>
        </section>
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
    ({ file, url }: GenerateDevCardParams = {}) =>
      request(graphqlUrl, GENERATE_DEVCARD_MUTATION, {
        file,
        url,
      }),
    {
      onMutate() {
        setImageError(null);
        setIsLoadingImage(true);
      },
      onSuccess(data: DevCardData) {
        const img = new Image();
        const { imageUrl } = data.devCard;
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
