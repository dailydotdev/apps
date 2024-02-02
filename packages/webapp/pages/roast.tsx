import React, { ReactElement, useContext, useState } from 'react';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import classNames from 'classnames';
import { FormErrorMessage } from '@dailydotdev/shared/src/components/utilities';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { labels } from '@dailydotdev/shared/src/lib';
import {
  Automation,
  useAutomation,
} from '@dailydotdev/shared/src/hooks/useAutomation';
import { HttpError } from '@dailydotdev/shared/src/lib/errors';
import { getLayout as getMainLayout } from '../components/layouts/MainLayout';
import { defaultOpenGraph } from '../next-seo';
import { getTemplatedTitle } from '../components/layouts/utils';

type RoastParams = {
  theme?: string;
};

type RoastResponse = {
  text: string;
  image: string;
};

type StepProps = {
  onGenerateImage: (params?: RoastParams) => unknown;
  roast?: RoastResponse;
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
      <h1 className="mt-10 font-bold typo-title1">Roast!</h1>
      <p className="mt-4 max-w-[32.5rem] text-center text-theme-label-secondary typo-body">
        Your Dev Card will show you stats about the publications and topics you
        love to read. Click on “Generate now” to get your card and share it with
        your friends
      </p>
      <div className="mt-10 h-12">
        {!loadingUser &&
          (user ? (
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              onClick={() => onGenerateImage({})}
              loading={isLoadingImage}
            >
              Get Roasted
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

const Step2 = ({ roast, error }: StepProps): ReactElement => {
  const { user } = useContext(AuthContext);
  const [downloading, setDownloading] = useState(false);

  const downloadImage = async (): Promise<void> => {
    setDownloading(true);
    const image = await fetch(roast.image);
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

  return (
    <div className="mx-2 mt-5 flex flex-col self-stretch laptop:self-center">
      <h1 className="mx-3 mb-8 font-bold typo-title1">Share your #Roast</h1>
      <main className="z-2 flex flex-col gap-10 laptop:flex-row laptopL:gap-20">
        <section className="flex flex-col">
          <LazyImage
            imgSrc={roast.image}
            imgAlt={roast.text}
            className="h-[25rem] w-72"
            eager
          />
          <div className="mx-2 mt-8 grid grid-cols-2 gap-4">
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              onClick={downloadImage}
              loading={downloading}
            >
              Download
            </Button>
          </div>
        </section>
        <section className="flex flex-col self-stretch text-theme-label-tertiary">
          {error && <FormErrorMessage role="alert">{error}</FormErrorMessage>}
        </section>
      </main>
    </div>
  );
};

// TODO: Add the correct SEO
const seo: NextSeoProps = {
  title: getTemplatedTitle('Roaster 🐓'),
  description: "It's show time!!!",
  openGraph: {
    ...defaultOpenGraph,
    type: 'website',
    site_name: 'daily.dev',
  },
};

const RoastPage = (): ReactElement => {
  const [step, setStep] = useState(0);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [roast, setRoast] = useState<RoastResponse>();
  const [imageError, setImageError] = useState<string>();

  const onError = (err?: HttpError) => {
    if (err?.statusCode === 429) {
      setImageError(labels.error.rateLimit);
    } else if (err?.statusCode < 500) {
      setImageError(err.response);
    } else {
      setImageError(labels.error.generic);
    }
    setIsLoadingImage(false);
  };

  const { run: generateRoast } = useAutomation<
    RoastResponse,
    HttpError,
    RoastParams
  >(Automation.Roaster, {
    onMutate() {
      setImageError(null);
      setIsLoadingImage(true);
    },
    onSuccess(res) {
      const img = new Image();
      img.src = res.image;
      img.onload = () => {
        setRoast(res);
        setIsLoadingImage(false);
        setStep(1);
      };
      img.onerror = () => onError();
    },
    onError,
  });

  const stepProps: StepProps = {
    onGenerateImage: generateRoast,
    roast,
    isLoadingImage,
    error: imageError,
  };
  return (
    <div
      className={classNames(
        'page mx-auto flex min-h-page max-w-full flex-col items-center justify-center px-6 py-10 tablet:-mt-12',
        step === 1 && 'laptop:flex-row laptop:gap-20',
      )}
    >
      <NextSeo {...seo} />
      {!step ? <Step1 {...stepProps} /> : <Step2 {...stepProps} />}
    </div>
  );
};

RoastPage.getLayout = getMainLayout;
RoastPage.layoutProps = { screenCentered: false };

export default RoastPage;
