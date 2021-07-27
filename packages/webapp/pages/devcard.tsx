import React, { ChangeEvent, ReactElement, useContext, useState } from 'react';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
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
  logDownloadDevCard,
  logGenerateDevCard,
} from '@dailydotdev/shared/src/lib/analytics';
import { DevCardData, GENERATE_DEVCARD_MUTATION } from '../graphql/devcard';
import { getLayout as getMainLayout } from '../components/layouts/MainLayout';
import { defaultOpenGraph } from '../next-seo';

const TWO_MEGABYTES = 2 * 1024 * 1024;

type StepProps = {
  onGenerateImage: (file?: File) => unknown;
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
      <h1 className="mt-10 typo-title1 font-bold">Grab your Dev Card</h1>
      <p
        className="mt-4 typo-body text-theme-label-secondary text-center"
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

const Step2 = ({
  onGenerateImage,
  devCardSrc,
  isLoadingImage,
  error,
}: StepProps): ReactElement => {
  const { user } = useContext(AuthContext);
  const [backgroundImageError, setBackgroundImageError] = useState<string>();
  // const [copyingImage, copyImageLink] = useCopyLink(() => devCardSrc);

  const embedCode = `<a href="https://app.daily.dev/${user?.username}"><img src="${devCardSrc}" width="400" alt="${user?.name}'s Dev Card"/></a>`;
  const [copyingEmbed, copyEmbed] = useCopyLink(() => embedCode);
  const [downloading, setDownloading] = useState(false);

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
    onGenerateImage(file);
  };

  const finalError = error || backgroundImageError;

  return (
    <>
      <div className="flex flex-col self-stretch laptop:self-center items-center mx-2">
        <Tilt
          className="self-stretch laptop:w-96"
          glareEnable
          perspective={1000}
          glareMaxOpacity={0.25}
          glarePosition="all"
          trackOnWindow
          style={{ transformStyle: 'preserve-3d' }}
        >
          <LazyImage
            imgSrc={devCardSrc}
            imgAlt="Your Dev Card"
            ratio="136.5%"
            eager
          />
        </Tilt>
        <Button
          tag="label"
          className="btn-secondary mt-10"
          loading={isLoadingImage}
        >
          <input
            type="file"
            name="backgroundImage"
            data-testid="backgroundImage"
            accept="image/png,image/jpeg"
            onChange={onFileChange}
            className="hidden"
          />
          Change background
        </Button>
        {finalError && (
          <FormErrorMessage role="alert">{finalError}</FormErrorMessage>
        )}
      </div>
      <div className="flex flex-col self-stretch laptop:self-center mt-16 laptop:mt-0">
        <h1 className="typo-title1 font-bold">Share your #DevCard</h1>
        <div className="flex mt-10">
          <Button
            className="btn-primary"
            buttonSize="large"
            onClick={downloadImage}
            loading={downloading}
          >
            Download
          </Button>
          {/* <Button */}
          {/*  className="btn-secondary ml-4" */}
          {/*  buttonSize="large" */}
          {/*  onClick={copyImageLink} */}
          {/* > */}
          {/*  {!copyingImage ? 'Copy link' : 'Copied!'} */}
          {/* </Button> */}
        </div>
        <div className="flex flex-col self-stretch items-start mt-10">
          <h4 className="font-bold typo-caption1 mt-1">Embed</h4>
          <textarea
            className="typo-body bg-theme-float py-2 px-4 resize-none self-stretch rounded-10 mt-1 laptop:w-80"
            readOnly
            wrap="hard"
            style={{ height: rem(124) }}
          >
            {embedCode}
          </textarea>
          <Button className="btn-secondary mt-4" onClick={copyEmbed}>
            {!copyingEmbed ? 'Copy code' : 'Copied!'}
          </Button>
        </div>
      </div>
    </>
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

  const onError = () =>
    setImageError('Something went wrong, please try again...');

  const { mutateAsync: generateDevCard } = useMutation(
    (file?: File | undefined) =>
      request(`${apiUrl}/graphql`, GENERATE_DEVCARD_MUTATION, {
        file,
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
DevCardPage.layoutProps = {
  responsive: false,
};

export default DevCardPage;
