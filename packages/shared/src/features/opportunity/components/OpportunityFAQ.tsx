import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities';
import { RadixAccordion } from '../../../components/accordion';

const faq = [
  {
    title: 'How do you decide which jobs to show me?',
    description:
      'We look at your skills, interests, and career goals based on your profile and activity on the platform. From there, we surface roles that we believe are genuinely worth your attention. The goal is not to flood you with options but to show you matches that can actually move your career forward.',
  },
  {
    title: 'How can I increase my chances of getting hired?',
    description:
      'The more context you share, the better we can match you. Upload your CV, complete your profile, and set your job preferences so we know your skills, your must haves, and your deal breakers. This lets us filter out noise and prioritize roles that are most likely to turn into real offers. Your CV and details stay private until you approve a match.',
  },
  {
    title: 'Will recruiters contact me directly?',
    description:
      'No. Recruiters never get direct access to you without your approval. We first confirm there is genuine mutual interest before making any introductions, so you do not get blindsided by cold DMs or random emails. You decide if and when conversations happen.',
  },
  {
    title:
      'What would I need to provide in order to get these kinds of job matches going forward?',
    description:
      'Uploading your CV and answering a few quick questions about your experience, preferences, and goals helps us do the heavy lifting for you. It lets us filter out irrelevant roles and focus on matches that respect your time. Your CV is never shared with a recruiter until you approve a job match and we have confirmed mutual interest.',
  },
  {
    title: 'Can I set the conditions for the job matches I see?',
    description:
      'Yes. What you see at first is our best initial guess based on your profile, but you are in control. In your profile settings, you can set what “worth it” means to you, including role type, salary expectations, tech stack, location, and more. Every future job match must meet those conditions before it reaches you.',
  },
  {
    title: 'Do I have to pay for this service? (Hint: No)',
    description:
      'No. This is free for developers. We are building a better, more respectful way to get hired, which means no paywalls and no hidden fees for being introduced to a recruiter.',
  },
  {
    title: 'What happens after I approve a job match?',
    description:
      'We may ask for a few more details or quick screening answers to save time for both you and the recruiter. Then we talk directly with the recruiter to confirm they want to move forward. If both sides say yes, we make the warm introduction.',
  },
  {
    title: 'Will you share my CV or profile without my permission?',
    description:
      'Never. Your information stays private until you explicitly approve a job match and we have confirmed mutual interest with the recruiter. Until then, no one outside our team knows you have been approached.',
  },
  {
    title: 'Is this going to turn into another inbox full of recruiter spam?',
    description:
      'No. You will not get cold DMs, random connection requests, or templated outreach here. Every job match you see is opt in, has context, and is checked against your conditions before it reaches you.',
  },
  {
    title: 'Are you going to waste my time with irrelevant roles?',
    description:
      'No. The point of this system is to remove as much noise as possible. You will only see roles that meet your criteria or have a strong reason to be surfaced. When you hear from us, you know it is worth a look.',
  },
];

export const OpportunityFAQ = (): ReactElement => {
  return (
    <FlexCol className="w-full gap-10 pb-10 text-center">
      <Typography
        type={TypographyType.Title3}
        bold
        color={TypographyColor.Tertiary}
      >
        Everything else you might want to know
      </Typography>
      <RadixAccordion items={faq} />
    </FlexCol>
  );
};
