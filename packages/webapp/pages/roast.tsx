import React, { ReactElement, ReactNode, useContext, useState } from 'react';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
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
import { Dropdown } from '@dailydotdev/shared/src/components/fields/Dropdown';
import { useMutation } from '@tanstack/react-query';
import { downloadUrl } from '@dailydotdev/shared/src/lib/blob';
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

const themes: { label: string; value: string }[] = [
  { label: 'Maximum suffering', value: 'max' },
  { label: 'Medium suffering', value: 'medium' },
  { label: 'Mild suffering', value: 'mild' },
];
const themesLabels = themes.map((t) => t.label);

const Step1 = ({ onGenerateImage, error }: StepProps): ReactElement => {
  const { user, showLogin } = useContext(AuthContext);
  const [themeIndex, setThemeIndex] = useState(0);
  const onClick = user
    ? () => onGenerateImage({ theme: themes[themeIndex].value })
    : () => showLogin({ trigger: AuthTriggers.Roast });

  return (
    <>
      <LazyImage
        imgSrc="https://daily-now-res.cloudinary.com/image/upload/s--bLTH_SfU--/f_auto/v1707242870/public/Roast-emoji.png.png"
        imgAlt="Devil emoji"
        ratio="80%"
        className="-mb-12 w-[21.25rem]"
      />
      <div className="flex flex-col items-center gap-8">
        <h2 className="text-center font-bold typo-title2">
          Get roasted based on your reading history
        </h2>
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-text-tertiary typo-body">
            Suffering level:
          </p>
          <Dropdown
            options={themesLabels}
            selectedIndex={themeIndex}
            onChange={(_, index) => setThemeIndex(index)}
          />
        </div>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          onClick={onClick}
        >
          Roast me - I&apos;m ready
        </Button>
        {error && <FormErrorMessage role="alert">{error}</FormErrorMessage>}
      </div>
    </>
  );
};

const Step2 = ({ roast, error }: StepProps): ReactElement => {
  const { user } = useContext(AuthContext);
  const { mutateAsync: onDownloadUrl, isLoading } = useMutation(downloadUrl);

  const downloadImage = async (): Promise<void> => {
    await onDownloadUrl({ url: roast.image, filename: `${user.username}.png` });
  };

  return (
    <div className="flex w-full max-w-[50rem] flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-center font-bold typo-title2	">
          Your roast is ready 🤬
        </h2>
        <p className="text-center text-text-tertiary typo-body">
          Download and share #IGotRoasted 📸
        </p>
      </div>
      <LazyImage
        imgSrc={roast.image}
        imgAlt={roast.text}
        ratio="75%"
        className="w-full"
        eager
      />
      <div className="flex flex-row justify-center gap-4">
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Large}
          onClick={() => window.location.reload()}
        >
          Start over
        </Button>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          onClick={downloadImage}
          loading={isLoading}
        >
          Download image
        </Button>
      </div>
      {error && <FormErrorMessage role="alert">{error}</FormErrorMessage>}
    </div>
  );
};

const Loading = (): ReactElement => {
  return (
    <>
      <div className="relative -mb-12">
        <LazyImage
          imgSrc="https://daily-now-res.cloudinary.com/image/upload/s--a3Z3K5Tg--/v1707244220/public/Blurry%20colors.png.png"
          imgAlt="Gradient"
          ratio="80%"
          className="w-[21.25rem]"
        />
        <div
          className="absolute bottom-0 left-0 right-0 top-0 flex animate-bounce items-center	justify-center typo-tera"
          style={{ animationDuration: '800ms' }}
        >
          😈
        </div>
      </div>
      <h2 className="text-center font-bold typo-title2">
        Roasting in progress... Brace yourself
      </h2>
      <p className="mt-4 text-center text-text-tertiary typo-body">
        It takes 40 seconds to roast a developer, wanna play{' '}
        <a
          href="https://buzzwordquiz.dev/"
          target="_blank"
          className="underline"
        >
          buzzword quiz
        </a>{' '}
        in the meantime?
      </p>
    </>
  );
};

const seo: NextSeoProps = {
  title: getTemplatedTitle('Get Roasted'),
  description:
    'Experience the most brutally honest developer roast of your life. Perfect for those who love a good ego check mixed with tech wisdom. Warning: Not for the faint of heart or the easily offended.',
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

  let child: ReactNode;
  if (isLoadingImage) {
    child = <Loading />;
  } else if (!step) {
    child = <Step1 {...stepProps} />;
  } else {
    child = <Step2 {...stepProps} />;
  }

  return (
    <div
      className={classNames(
        'page mx-auto flex min-h-page w-full flex-col items-center justify-center px-6',
        step === 1 && 'laptop:flex-row laptop:gap-20',
      )}
    >
      <NextSeo {...seo} />
      {child}
    </div>
  );
};

RoastPage.getLayout = getMainLayout;
RoastPage.layoutProps = { screenCentered: false };

export default RoastPage;
