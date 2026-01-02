/**
 * DEMO COMPONENT
 * This is an example showing how GitIntegrationStats can be added to an experience item.
 * For demo purposes only - showcases the collapsible GitHub/GitLab integration.
 */
import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../../components/typography/Typography';
import { Image, ImageType } from '../../../../../components/image/Image';
import { Pill, PillSize } from '../../../../../components/Pill';
import { GitIntegrationStats } from './GitIntegrationStats';
import { generateMockGitStats } from './types';

interface ExperienceWithGitStatsProps {
  provider?: 'github' | 'gitlab';
}

/**
 * Demo component showing an experience item with GitHub/GitLab integration
 * Use this as reference for how to integrate into the actual UserExperienceItem
 */
export function ExperienceWithGitStats({
  provider = 'github',
}: ExperienceWithGitStatsProps): ReactElement {
  // Generate mock data for demo
  const gitData = generateMockGitStats(provider);

  return (
    <div className="flex flex-col rounded-16 border border-border-subtlest-tertiary p-4">
      {/* Simulated experience header */}
      <div className="flex gap-3">
        <Image
          className="h-10 w-10 rounded-10 object-cover"
          type={ImageType.Organization}
          src={null}
        />
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <Typography type={TypographyType.Subhead} bold>
              Senior Software Engineer
            </Typography>
            <Pill
              label="Current"
              size={PillSize.Small}
              className="bg-accent-onion-subtler text-accent-onion-default"
            />
          </div>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
          >
            Acme Technologies
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Jan 2022 - Present | San Francisco, CA
          </Typography>

          {/* Description */}
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Secondary}
            className="mt-2"
          >
            Building scalable infrastructure and developer tools. Leading the
            platform team responsible for CI/CD pipelines and deployment
            automation.
          </Typography>

          {/* Skills */}
          <div className="mt-2 flex flex-wrap gap-2">
            {['TypeScript', 'React', 'Node.js'].map((skill) => (
              <Pill
                key={skill}
                label={skill}
                size={PillSize.Small}
                className="border border-border-subtlest-tertiary text-text-quaternary"
              />
            ))}
          </div>
        </div>
      </div>

      {/* GitHub/GitLab Integration - Collapsible section */}
      <GitIntegrationStats data={gitData} initiallyOpen />
    </div>
  );
}
