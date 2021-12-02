import React, {
  ChangeEvent,
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import GitHubIcon from '@dailydotdev/shared/icons/github.svg';
import { RadioItem } from '@dailydotdev/shared/src/components/fields/RadioItem';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { LoaderOverlay } from '@dailydotdev/shared/src/components/LoaderOverlay';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import request from 'graphql-request';
import { useMutation } from 'react-query';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import classNames from 'classnames';
import rem from '@dailydotdev/shared/macros/rem.macro';
import { useCopyLink } from '@dailydotdev/shared/src/hooks/useCopyLink';
import { FormErrorMessage } from '@dailydotdev/shared/src/components/utilities';
import Tilt from 'react-parallax-tilt';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import DevCardPlaceholder from '@dailydotdev/shared/src/components/DevCardPlaceholder';
import {
  logDevCardPageView,
  logDownloadDevCard,
  logGenerateDevCard,
} from '@dailydotdev/shared/src/lib/analytics';
import { DevCardData, GENERATE_DEVCARD_MUTATION } from '../graphql/devcard';
import { getLayout as getMainLayout } from '../components/layouts/MainLayout';
import { defaultOpenGraph } from '../next-seo';

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

  return (
    <>
      <DevCardPlaceholder profileImage={user?.image} width={108} />
      <h1 className="mt-10 font-bold typo-title1">Grab your Dev Card</h1>
      <p
        className="mt-4 text-center typo-body text-theme-label-secondary"
        style={{ maxWidth: rem(520) }}
      >
        Your Dev Card will show you stats about the publications and topics you
        love to read. Click on “Generate now” to get your card and share it with
        your friends
      </p>
      <div className="mt-10 h-12">
        {!loadingUser &&
          (user ? (
            <Button
              className="btn-primary"
              buttonSize="large"
              onClick={() => onGenerateImage()}
              loading={isLoadingImage}
            >
              Generate now
            </Button>
          ) : (
            <Button
              className="btn-secondary"
              buttonSize="large"
              onClick={() => showLogin('devcard')}
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

const bgUrlOption = [
  {
    label: 'Christmas',
    value:
      'https://daily-now-res.cloudinary.com/image/upload/v1634801812/devcard/bg/christmas.jpg',
    caption: {
      text: '(Limited edition) 🎄',
      className: 'text-theme-status-success',
    },
  },
];

const Step2 = ({
  onGenerateImage,
  devCardSrc,
  isLoadingImage,
  error,
}: StepProps): ReactElement => {
  const { user } = useContext(AuthContext);
  const inputRef = useRef<HTMLInputElement>();
  const [backgroundImageError, setBackgroundImageError] = useState<string>();
  // const [copyingImage, copyImageLink] = useCopyLink(() => devCardSrc);

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
    await logDownloadDevCard();
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
    <div className="flex flex-col self-stretch laptop:self-center mx-2 mt-5">
      <h1 className="mx-3 mb-8 font-bold typo-title1">Share your #DevCard</h1>
      <main className="grid grid-cols-1 laptop:grid-cols-2 gap-10 laptop:gap-20">
        <section className="flex flex-col">
          <Tilt
            className="overflow-hidden relative self-stretch laptop:w-96"
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
              ratio="136.5%"
              eager
            />
            {isLoadingImage && <LoaderOverlay invertColor />}
          </Tilt>
          <div className="grid grid-cols-2 gap-4 mx-2 mt-8">
            <Button
              className="btn-primary"
              buttonSize="large"
              onClick={downloadImage}
              loading={downloading}
            >
              Download
            </Button>
            <Button
              className="btn-secondary"
              buttonSize="large"
              onClick={copyLink}
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
          <h2 className="typo-headline">Customize Style</h2>
          <div className={classNames('flex flex-col -my-0.5 items-start mt-8')}>
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
          <div className="flex flex-col items-start self-stretch mt-10">
            <h4 className="mt-1 font-bold typo-caption1">Embed</h4>
            <textarea
              className="self-stretch py-2 px-4 mt-1 laptop:w-80 bg-theme-float rounded-10 resize-none typo-body"
              readOnly
              wrap="hard"
              style={{ height: rem(124) }}
            >
              {embedCode}
            </textarea>
            <Button
              className="mt-4 btn-secondary"
              buttonSize="small"
              onClick={copyEmbed}
            >
              {!copyingEmbed ? 'Copy code' : 'Copied!'}
            </Button>
            <ClickableText
              tag="a"
              href="https://daily.dev/blog/adding-the-daily-devcard-to-your-github-profile?utm_source=webapp&utm_medium=devcard&utm_campaign=devcardguide&utm_id=inapp"
              className="mt-6 typo-body"
              defaultTypo={false}
              target="_blank"
            >
              <GitHubIcon className="mr-2" />
              Add DevCard to your GitHub profile
            </ClickableText>
          </div>
        </section>
      </main>
    </div>
  );
};

const seo: NextSeoProps = {
  title: 'Grab your Dev Card',
  titleTemplate: '%s | daily.dev',
  description:
    'Dev Card will show you stats about the publications and topics you love to read. Generate yours now.',
  openGraph: {
    ...defaultOpenGraph,
    type: 'website',
    site_name: 'daily.dev',
  },
};

const DevCardPage = (): ReactElement => {
  const [step, setStep] = useState(0);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [devCardSrc, setDevCardSrc] = useState<string>();
  const [imageError, setImageError] = useState<string>();

  useEffect(() => {
    logDevCardPageView();
  }, []);

  const onError = () =>
    setImageError('Something went wrong, please try again...');

  const { mutateAsync: generateDevCard } = useMutation(
    ({ file, url }: GenerateDevCardParams = {}) =>
      request(`${apiUrl}/graphql`, GENERATE_DEVCARD_MUTATION, {
        file,
        url,
      }),
    {
      onMutate() {
        setImageError(null);
        setIsLoadingImage(true);
        logGenerateDevCard();
      },
      onSuccess(data: DevCardData) {
        const img = new Image();
        const { imageUrl } = data.devCard;
        img.src = imageUrl;
        img.onload = () => {
          setDevCardSrc(imageUrl);
          setIsLoadingImage(false);
          setStep(1);
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
        'page flex flex-col items-center px-6 py-10 laptop:-mt-12 laptop:justify-center',
        step === 1 && 'laptop:flex-row laptop:gap-20',
      )}
    >
      <NextSeo {...seo} />
      {!step ? <Step1 {...stepProps} /> : <Step2 {...stepProps} />}
    </div>
  );
};

DevCardPage.getLayout = getMainLayout;

export default DevCardPage;
