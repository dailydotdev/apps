import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { largeNumberFormat } from '../../lib';
import { SnapshotFrame } from './SnapshotFrame';
import {
  SnapshotStat,
  SnapshotStatRow,
  SnapshotStatValue,
} from './SnapshotStats';

const MUTED = colors.salt['90'];

const COVER_HEIGHT = 268;
const AVATAR_SIZE = 208;
const AVATAR_RING = 8;
const AVATAR_RADIUS = 46;
/** The frame's body padding, which the cover has to escape to bleed. */
const BODY_PADDING = 58;

export interface ProfileSnapshotCardProps {
  name: string;
  handle: string;
  bio?: string;
  image?: string;
  cover?: string;
  postsRead: number;
  joined: string;
  reputation: number;
  seed?: string;
}

function ProfileSnapshotCardComponent(
  {
    name,
    handle,
    bio,
    image,
    cover,
    postsRead,
    joined,
    reputation,
    seed,
  }: ProfileSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  return (
    <SnapshotFrame logoPlacement="top-left" ref={ref} seed={seed ?? handle}>
      <div className="flex flex-1 flex-col items-center text-center">
        <div
          style={{
            marginLeft: -BODY_PADDING,
            marginRight: -BODY_PADDING,
            marginTop: -BODY_PADDING,
            width: `calc(100% + ${BODY_PADDING * 2}px)`,
            height: COVER_HEIGHT,
            background: cover
              ? `url("${cover}") center / cover no-repeat`
              : `linear-gradient(135deg, ${colors.onion['60']}, ${colors.cabbage['50']})`,
          }}
        />

        {image && (
          // The ring is a padded wrapper rather than a border on the image:
          // its radius is the image's plus the ring width, so the two curves
          // stay concentric and no cover shows through at the corners.
          <div
            style={{
              padding: AVATAR_RING,
              borderRadius: AVATAR_RADIUS + AVATAR_RING,
              background: colors.pepper['90'],
              // Straddle the cover's lower edge the way the profile page does.
              marginTop: -(AVATAR_SIZE / 2),
              boxShadow: '0 18px 40px rgba(4, 2, 9, 0.55)',
              lineHeight: 0,
            }}
          >
            <img
              src={image}
              alt=""
              crossOrigin="anonymous"
              className="block object-cover"
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_RADIUS,
              }}
            />
          </div>
        )}

        <div className="mt-6 flex flex-col gap-1">
          <span
            className="font-bold text-white"
            style={{ fontSize: 54, lineHeight: 1.1 }}
          >
            {name}
          </span>
          <span style={{ color: MUTED, fontSize: 28 }}>{handle}</span>
        </div>

        {bio && (
          <p
            className="mt-4"
            style={{
              color: MUTED,
              fontSize: 28,
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
            }}
          >
            {bio}
          </p>
        )}

        <SnapshotStatRow>
          <SnapshotStat
            label="Posts read"
            value={
              <SnapshotStatValue>
                {largeNumberFormat(postsRead) ?? postsRead}
              </SnapshotStatValue>
            }
          />
          <SnapshotStat
            label="Joined"
            value={<SnapshotStatValue compact>{joined}</SnapshotStatValue>}
          />
          <SnapshotStat
            label="Reputation"
            value={
              <SnapshotStatValue>
                {largeNumberFormat(reputation) ?? reputation}
              </SnapshotStatValue>
            }
          />
        </SnapshotStatRow>
      </div>
    </SnapshotFrame>
  );
}

export const ProfileSnapshotCard = forwardRef(ProfileSnapshotCardComponent);
