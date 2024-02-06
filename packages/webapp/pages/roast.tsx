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
import { Dropdown } from '@dailydotdev/shared/src/components/fields/Dropdown';
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

const Step1 = ({
  onGenerateImage,
  isLoadingImage,
  error,
}: StepProps): ReactElement => {
  const { user, showLogin } = useContext(AuthContext);
  const [themeIndex, setThemeIndex] = useState(0);
  const onClick = user
    ? () => onGenerateImage({ theme: themes[themeIndex].value })
    : () => showLogin({ trigger: AuthTriggers.Roast });

  return (
    <div className="flex flex-col items-center gap-8">
      <h2 className="font-bold typo-title2">
        Get roasted based on your reading history
      </h2>
      <div className="flex flex-col items-center gap-4">
        <p className="font-bold text-theme-label-tertiary typo-body">
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
        loading={isLoadingImage}
      >
        Roast me - I'm ready
      </Button>
      {error && <FormErrorMessage role="alert">{error}</FormErrorMessage>}
    </div>
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
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <h2 className="font-bold typo-title2">Your roast is ready 🤬</h2>
        <p className="text-theme-label-tertiary typo-body">
          Download and share #IGotRoasted 📸
        </p>
      </div>
      <LazyImage
        imgSrc={roast.image}
        imgAlt={roast.text}
        ratio="70%"
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
          loading={downloading}
        >
          Download image
        </Button>
      </div>
      {error && <FormErrorMessage role="alert">{error}</FormErrorMessage>}
    </div>
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
  const [roast, setRoast] = useState<RoastResponse>({
    image:
      'https://cdn.renderform.io/ydOkVgHU61yY4Li60lSJ/results/req-c866b874-3518-41fd-b55d-ca9e0d54f3b8.jpg',
    text: '...',
  });
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
