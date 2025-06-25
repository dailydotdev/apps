import React, { useState } from 'react';
import { Switch } from '../fields/Switch';
import { ArrowIcon } from '../icons';
import { IconSize } from '../Icon';
import { HorizontalSeparator } from '../utilities';
import { Checkbox } from '../fields/Checkbox';
import { HourDropdown } from '../fields/HourDropdown';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';

type NotificationTab = 'notifications' | 'email';

const NotificationsForm = () => {
  const { openModal } = useLazyModal();
  const [activeTab, setActiveTab] = useState<NotificationTab>('notifications');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [following, setFollowing] = useState(true);
  const [streaks, setStreaks] = useState(true);
  const [readingReminder, setReadingReminder] = useState(true);
  const [achievements, setAchievements] = useState(true);
  const [sourceSuggestions, setSourceSuggestions] = useState(true);
  const [submittedPost, setSubmittedPost] = useState(true);
  const [squadRoles, setSquadRoles] = useState(true);
  const [squadModeration, setSquadModeration] = useState(true);
  const [productTips, setProductTips] = useState(true);
  const [readingReminderTime, setReadingReminderTime] = useState(9);

  const [comments, setComments] = useState(true);
  const [replies, setReplies] = useState(true);
  const [upvotesOnPosts, setUpvotesOnPosts] = useState(true);
  const [upvotesOnComments, setUpvotesOnComments] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [coresAndAwards, setCoresAndAwards] = useState(true);
  const [reportUpdates, setReportUpdates] = useState(true);

  const [sourceNewPost, setSourceNewPost] = useState(true);
  const [userNewPosts, setUserNewPosts] = useState(false);
  const [threadsYouFollow, setThreadsYouFollow] = useState(true);
  const [collectionsYouFollow, setCollectionsYouFollow] = useState(true);
  const [readItLaterReminders, setReadItLaterReminders] = useState(true);

  const [streakExpiry, setStreakExpiry] = useState(true);
  const [restoreBrokenStreak, setRestoreBrokenStreak] = useState(true);

  // Email-specific state
  const [squadNewPost, setSquadNewPost] = useState(true);
  const [creatorUpdates, setCreatorUpdates] = useState(true);
  const [personalizedDigest, setPersonalizedDigest] = useState(true);
  const [digestFrequency, setDigestFrequency] = useState<
    'daily' | 'weekly' | 'off'
  >('daily');
  const [digestTime, setDigestTime] = useState(9);
  const [inAppPurchases, setInAppPurchases] = useState(true);
  const [paidSubscriptions, setPaidSubscriptions] = useState(true);
  const [newUserWelcome, setNewUserWelcome] = useState(true);
  const [majorAnnouncements, setMajorAnnouncements] = useState(true);
  const [communityMarketing, setCommunityMarketing] = useState(true);
  const [criticalSystemAlerts] = useState(true); // Always on, disabled
  const [unsubscribeAll, setUnsubscribeAll] = useState(false);

  return (
    <div className="flex max-w-3xl flex-col ">
      <div className="flex border-b border-border-subtlest-tertiary">
        <button
          type="button"
          className={`border-b-2 px-4 py-3 font-bold text-text-primary transition-colors typo-callout ${
            activeTab === 'notifications'
              ? 'border-accent-cabbage-default bg-surface-float'
              : 'border-transparent hover:text-text-secondary'
          }`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          type="button"
          className={`border-b-2 px-4 py-3 font-bold text-text-tertiary transition-colors typo-callout ${
            activeTab === 'email'
              ? 'border-accent-cabbage-default bg-surface-float'
              : 'border-transparent hover:text-text-secondary'
          }`}
          onClick={() => setActiveTab('email')}
        >
          Email
        </button>
      </div>

      <div className="flex flex-col gap-5 p-4">
        {activeTab === 'notifications' && (
          <>
            <div className="flex flex-row items-center gap-4">
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="font-bold text-text-primary typo-body">
                  Push notifications
                </h3>
                <p className="text-text-tertiary typo-footnote">
                  Turn this on to get real-time updates on your device.
                  You&apos;ll still see in-app notifications even if this is
                  off. Requires additional device permissions.
                </p>
              </div>
              <Switch
                inputId="push-notifications"
                name="push-notifications"
                checked={pushNotifications}
                onToggle={() => setPushNotifications(!pushNotifications)}
                compact
              />
            </div>

            <HorizontalSeparator />

            <button
              className="flex flex-row items-center gap-4 text-left"
              type="button"
              onClick={() => openModal({ type: LazyModal.SquadsNotifications })}
            >
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="font-bold text-text-primary typo-body">
                  Squad notifications
                </h3>
                <p className="text-text-tertiary typo-footnote">
                  Control notifications for new posts in squads you&apos;ve
                  joined. Scroll down for moderation notification settings.
                </p>
              </div>
              <ArrowIcon size={IconSize.Size16} className="rotate-90" />
            </button>
            <HorizontalSeparator />
          </>
        )}

        <div className="flex flex-col gap-5">
          <h3 className="font-bold text-text-primary typo-body">Activity</h3>

          <div className="flex flex-row items-center justify-between">
            <span className="text-text-primary typo-callout">
              Comments on your posts
            </span>
            <Switch
              inputId={activeTab === 'email' ? 'email-comments' : 'comments'}
              name={activeTab === 'email' ? 'email-comments' : 'comments'}
              checked={comments}
              onToggle={() => setComments(!comments)}
              compact={false}
            />
          </div>

          <div className="flex flex-row items-center justify-between">
            <span className="text-text-primary typo-callout">
              Replies to your comments
            </span>
            <Switch
              inputId={activeTab === 'email' ? 'email-replies' : 'replies'}
              name={activeTab === 'email' ? 'email-replies' : 'replies'}
              checked={replies}
              onToggle={() => setReplies(!replies)}
              compact={false}
            />
          </div>

          <div className="flex flex-row items-center justify-between">
            <span className="text-text-primary typo-callout">
              Upvotes on your posts
            </span>
            <Switch
              inputId={
                activeTab === 'email' ? 'email-upvotes-posts' : 'upvotes-posts'
              }
              name={
                activeTab === 'email' ? 'email-upvotes-posts' : 'upvotes-posts'
              }
              checked={upvotesOnPosts}
              onToggle={() => setUpvotesOnPosts(!upvotesOnPosts)}
              compact={false}
            />
          </div>

          <div className="flex flex-row items-center justify-between">
            <span className="text-text-primary typo-callout">
              Upvotes on your comments
            </span>
            <Switch
              inputId={
                activeTab === 'email'
                  ? 'email-upvotes-comments'
                  : 'upvotes-comments'
              }
              name={
                activeTab === 'email'
                  ? 'email-upvotes-comments'
                  : 'upvotes-comments'
              }
              checked={upvotesOnComments}
              onToggle={() => setUpvotesOnComments(!upvotesOnComments)}
              compact={false}
            />
          </div>

          <div className="flex flex-row items-center justify-between">
            <span className="text-text-primary typo-callout">
              Mentions of your username
            </span>
            <Switch
              inputId={activeTab === 'email' ? 'email-mentions' : 'mentions'}
              name={activeTab === 'email' ? 'email-mentions' : 'mentions'}
              checked={mentions}
              onToggle={() => setMentions(!mentions)}
              compact={false}
            />
          </div>

          <div className="flex flex-row items-center justify-between">
            <span className="text-text-primary typo-callout">
              Cores & Awards you receive
            </span>
            <Switch
              inputId={
                activeTab === 'email' ? 'email-cores-awards' : 'cores-awards'
              }
              name={
                activeTab === 'email' ? 'email-cores-awards' : 'cores-awards'
              }
              checked={coresAndAwards}
              onToggle={() => setCoresAndAwards(!coresAndAwards)}
              compact={false}
            />
          </div>

          <div className="flex flex-row items-center justify-between">
            <span className="text-text-primary typo-callout">
              Report updates
            </span>
            <Switch
              inputId={
                activeTab === 'email'
                  ? 'email-report-updates'
                  : 'report-updates'
              }
              name={
                activeTab === 'email'
                  ? 'email-report-updates'
                  : 'report-updates'
              }
              checked={reportUpdates}
              onToggle={() => setReportUpdates(!reportUpdates)}
              compact={false}
            />
          </div>
        </div>

        <HorizontalSeparator />

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-text-primary typo-body">Updates</h3>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center justify-between">
                <span className="text-text-primary typo-callout">
                  Following
                </span>
                <Switch
                  inputId={
                    activeTab === 'email' ? 'email-following' : 'following'
                  }
                  name={activeTab === 'email' ? 'email-following' : 'following'}
                  checked={following}
                  onToggle={() => setFollowing(!following)}
                  compact={false}
                />
              </div>
              {activeTab === 'notifications' && (
                <p className="text-text-tertiary typo-footnote">
                  Get notified when sources, users, collections, or threads you
                  follow are updated. You can manage each below.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between gap-1">
                <span className="text-text-secondary typo-footnote">
                  Source new post
                </span>
                <Checkbox
                  name={
                    activeTab === 'email'
                      ? 'email-source-new-post'
                      : 'source-new-post'
                  }
                  checked={sourceNewPost}
                  onToggleCallback={() => setSourceNewPost(!sourceNewPost)}
                  className="!pr-0"
                  checkmarkClassName="!mr-0"
                />
              </div>

              <div className="flex flex-row items-center justify-between gap-1">
                <span className="text-text-secondary typo-footnote">
                  {activeTab === 'email' ? 'User new post' : 'User new posts'}
                </span>
                <Checkbox
                  name={
                    activeTab === 'email'
                      ? 'email-user-new-post'
                      : 'user-new-posts'
                  }
                  checked={userNewPosts}
                  onToggleCallback={() => setUserNewPosts(!userNewPosts)}
                  className="!pr-0"
                  checkmarkClassName="!mr-0"
                />
              </div>

              {activeTab === 'email' && (
                <div className="flex flex-row items-center justify-between gap-1">
                  <span className="text-text-secondary typo-footnote">
                    Squad new post
                  </span>
                  <Checkbox
                    name="email-squad-new-post"
                    checked={squadNewPost}
                    onToggleCallback={() => setSquadNewPost(!squadNewPost)}
                    className="!pr-0"
                    checkmarkClassName="!mr-0"
                  />
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="flex flex-row items-center justify-between gap-1">
                  <span className="text-text-secondary typo-footnote">
                    Threads you follow
                  </span>
                  <Checkbox
                    name="threads-follow"
                    checked={threadsYouFollow}
                    onToggleCallback={() =>
                      setThreadsYouFollow(!threadsYouFollow)
                    }
                    className="!pr-0"
                    checkmarkClassName="!mr-0"
                  />
                </div>
              )}

              <div className="flex flex-row items-center justify-between gap-1">
                <span className="text-text-secondary typo-footnote">
                  Collections you follow
                </span>
                <Checkbox
                  name={
                    activeTab === 'email'
                      ? 'email-collections-follow'
                      : 'collections-follow'
                  }
                  checked={collectionsYouFollow}
                  onToggleCallback={() =>
                    setCollectionsYouFollow(!collectionsYouFollow)
                  }
                  className="!pr-0"
                  checkmarkClassName="!mr-0"
                />
              </div>

              {activeTab === 'notifications' && (
                <div className="flex flex-row items-center justify-between gap-1">
                  <span className="text-text-secondary typo-footnote">
                    Read it later reminders
                  </span>
                  <Checkbox
                    name="read-later"
                    checked={readItLaterReminders}
                    onToggleCallback={() =>
                      setReadItLaterReminders(!readItLaterReminders)
                    }
                    className="!pr-0"
                    checkmarkClassName="!mr-0"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center justify-between">
                <span className="text-text-primary typo-callout">Streaks</span>
                <Switch
                  inputId={activeTab === 'email' ? 'email-streaks' : 'streaks'}
                  name={activeTab === 'email' ? 'email-streaks' : 'streaks'}
                  checked={streaks}
                  onToggle={() => setStreaks(!streaks)}
                  compact={false}
                />
              </div>
              <p className="text-text-tertiary typo-footnote">
                {activeTab === 'email'
                  ? 'Get an email when you break your streak and have a chance to restore it.'
                  : 'Stay on track and never miss a reading day. Get reminders to protect your streak or bring it back when it breaks.'}
              </p>
            </div>

            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-row items-center justify-between gap-1">
                  <span className="text-text-secondary typo-footnote">
                    Notify me before my streak expires
                  </span>
                  <Checkbox
                    name="streak-expiry"
                    checked={streakExpiry}
                    onToggleCallback={() => setStreakExpiry(!streakExpiry)}
                    className="!pr-0"
                    checkmarkClassName="!mr-0"
                  />
                </div>

                <div className="flex flex-row items-center justify-between gap-1">
                  <span className="text-text-secondary typo-footnote">
                    Restore broken streak
                  </span>
                  <Checkbox
                    name="restore-streak"
                    checked={restoreBrokenStreak}
                    onToggleCallback={() =>
                      setRestoreBrokenStreak(!restoreBrokenStreak)
                    }
                    className="!pr-0"
                    checkmarkClassName="!mr-0"
                  />
                </div>
              </div>
            )}
          </div>

          {activeTab === 'notifications' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between">
                  <span className="text-text-primary typo-callout">
                    Reading reminder
                  </span>
                  <Switch
                    inputId="reading-reminder"
                    name="reading-reminder"
                    checked={readingReminder}
                    onToggle={() => setReadingReminder(!readingReminder)}
                    compact={false}
                  />
                </div>
                <p className="text-text-tertiary typo-footnote">
                  Get a daily nudge to stay on top of your learning. Turning
                  this on requires push notification permissions. You can choose
                  the ideal time below.
                </p>
              </div>

              {readingReminder && (
                <HourDropdown
                  hourIndex={readingReminderTime}
                  setHourIndex={setReadingReminderTime}
                  className={{ container: 'w-40' }}
                />
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between">
              <span className="text-text-primary typo-callout">
                Achievements
              </span>
              <Switch
                inputId={
                  activeTab === 'email' ? 'email-achievements' : 'achievements'
                }
                name={
                  activeTab === 'email' ? 'email-achievements' : 'achievements'
                }
                checked={achievements}
                onToggle={() => setAchievements(!achievements)}
                compact={false}
              />
            </div>
            <p className="text-text-tertiary typo-footnote">
              {activeTab === 'email'
                ? 'Get email updates when you unlock new badges, milestones, or features.'
                : 'Get notified when you unlock new milestones, badges, or features.'}
            </p>
          </div>
        </div>

        {activeTab === 'notifications' && <HorizontalSeparator />}

        {activeTab === 'notifications' && (
          <div className="flex flex-col gap-5">
            <h3 className="font-bold text-text-primary typo-body">Creators</h3>

            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between">
                <span className="text-text-primary typo-callout">
                  Source suggestions
                </span>
                <Switch
                  inputId="source-suggestions"
                  name="source-suggestions"
                  checked={sourceSuggestions}
                  onToggle={() => setSourceSuggestions(!sourceSuggestions)}
                  compact={false}
                />
              </div>
              <p className="text-text-tertiary typo-footnote">
                Get notified on suggested sources, including review progress and
                outcomes.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between">
                <span className="text-text-primary typo-callout">
                  Submitted post
                </span>
                <Switch
                  inputId="submitted-post"
                  name="submitted-post"
                  checked={submittedPost}
                  onToggle={() => setSubmittedPost(!submittedPost)}
                  compact={false}
                />
              </div>
              <p className="text-text-tertiary typo-footnote">
                Get notified when your submitted post has been reviewed by a
                Squad moderator.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between">
                <span className="text-text-primary typo-callout">
                  Squad roles
                </span>
                <Switch
                  inputId="squad-roles"
                  name="squad-roles"
                  checked={squadRoles}
                  onToggle={() => setSquadRoles(!squadRoles)}
                  compact={false}
                />
              </div>
              <p className="text-text-tertiary typo-footnote">
                Get notified when your squad role changes, like becoming a
                moderator or admin.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && <HorizontalSeparator />}

        {activeTab === 'notifications' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center gap-4">
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="font-bold text-text-primary typo-body">
                  Squad moderation
                </h3>
                <p className="text-text-tertiary typo-footnote">
                  Turn this on to get moderation-related notifications for all
                  squads you moderate. You can fine-tune settings per squad
                  below.
                </p>
              </div>
              <Switch
                inputId="squad-moderation"
                name="squad-moderation"
                checked={squadModeration}
                onToggle={() => setSquadModeration(!squadModeration)}
                compact={false}
              >
                {squadModeration ? 'On' : 'Off'}
              </Switch>
            </div>

            {/* Squad List would go here - simplified for now */}
            {squadModeration && (
              <div className="flex flex-col gap-4 rounded-12 bg-surface-float p-4">
                <p className="text-text-tertiary typo-footnote">
                  Squad-specific moderation settings would appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && <HorizontalSeparator />}

        {activeTab === 'notifications' && (
          <div className="flex flex-col gap-5">
            <h3 className="font-bold text-text-primary typo-body">
              From daily.dev
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between">
                <span className="text-text-primary typo-callout">
                  Product tips
                </span>
                <Switch
                  inputId="product-tips"
                  name="product-tips"
                  checked={productTips}
                  onToggle={() => setProductTips(!productTips)}
                  compact={false}
                />
              </div>
              <p className="text-text-tertiary typo-footnote">
                Get occasional tips to help you discover features, save time,
                and get more out of daily.dev.
              </p>
            </div>
          </div>
        )}

        {/* Email-specific sections */}
        {activeTab === 'email' && (
          <>
            <HorizontalSeparator />

            {/* Creator updates */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between">
                <span className="text-text-primary typo-callout">
                  Creator updates
                </span>
                <Switch
                  inputId="email-creator-updates"
                  name="email-creator-updates"
                  checked={creatorUpdates}
                  onToggle={() => setCreatorUpdates(!creatorUpdates)}
                  compact={false}
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-text-tertiary typo-footnote">
                  Get email notifications about your posts, source suggestions,
                  analytics, and other creator activity on daily.dev.
                </p>
              </div>
            </div>

            <HorizontalSeparator />

            {/* Personalized digest */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center gap-4">
                <div className="flex flex-1 flex-col gap-1">
                  <h3 className="font-bold text-text-primary typo-body">
                    Personalized digest
                  </h3>
                  <p className="text-text-tertiary typo-footnote">
                    Our recommendation system scans everything on daily.dev and
                    sends you a tailored email with just the must-read posts.
                    Choose daily or weekly delivery and set your preferred send
                    time below.
                  </p>
                </div>
                <Switch
                  inputId="personalized-digest"
                  name="personalized-digest"
                  checked={personalizedDigest}
                  onToggle={() => setPersonalizedDigest(!personalizedDigest)}
                  compact={false}
                />
              </div>

              {personalizedDigest && (
                <div className="flex flex-col gap-4">
                  <HourDropdown
                    hourIndex={digestTime}
                    setHourIndex={setDigestTime}
                    className={{ container: 'w-40' }}
                  />

                  <div className="flex flex-col gap-4">
                    <button
                      type="button"
                      className="flex flex-row items-center justify-between"
                      onClick={() => setDigestFrequency('daily')}
                    >
                      <span className="text-text-primary typo-callout">
                        Daily
                      </span>
                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          digestFrequency === 'daily'
                            ? 'border-accent-cabbage-default bg-accent-cabbage-default'
                            : 'border-border-subtlest-primary'
                        }`}
                      >
                        {digestFrequency === 'daily' && (
                          <div className="m-0.5 h-3 w-3 rounded-full bg-surface-primary" />
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      className="flex flex-row items-center justify-between"
                      onClick={() => setDigestFrequency('weekly')}
                    >
                      <span className="text-text-primary typo-callout">
                        Weekly
                      </span>
                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          digestFrequency === 'weekly'
                            ? 'border-accent-cabbage-default bg-accent-cabbage-default'
                            : 'border-border-subtlest-primary'
                        }`}
                      >
                        {digestFrequency === 'weekly' && (
                          <div className="m-0.5 h-3 w-3 rounded-full bg-surface-primary" />
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      className="flex flex-row items-center justify-between"
                      onClick={() => setDigestFrequency('off')}
                    >
                      <span className="text-text-primary typo-callout">
                        Off
                      </span>
                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          digestFrequency === 'off'
                            ? 'border-accent-cabbage-default bg-accent-cabbage-default'
                            : 'border-border-subtlest-primary'
                        }`}
                      >
                        {digestFrequency === 'off' && (
                          <div className="m-0.5 h-3 w-3 rounded-full bg-surface-primary" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <HorizontalSeparator />

            {/* Billing */}
            <div className="flex flex-col gap-5">
              <h3 className="font-bold text-text-primary typo-body">Billing</h3>

              <div className="flex flex-row items-center justify-between">
                <span className="text-text-primary typo-callout">
                  In-app purchases
                </span>
                <Switch
                  inputId="in-app-purchases"
                  name="in-app-purchases"
                  checked={inAppPurchases}
                  onToggle={() => setInAppPurchases(!inAppPurchases)}
                  compact={false}
                />
              </div>

              <div className="flex flex-row items-center justify-between">
                <span className="text-text-primary typo-callout">
                  Paid subscriptions
                </span>
                <Switch
                  inputId="paid-subscriptions"
                  name="paid-subscriptions"
                  checked={paidSubscriptions}
                  onToggle={() => setPaidSubscriptions(!paidSubscriptions)}
                  compact={false}
                />
              </div>
            </div>

            <HorizontalSeparator />

            {/* From daily.dev */}
            <div className="flex flex-col gap-5">
              <h3 className="font-bold text-text-primary typo-body">
                From daily.dev
              </h3>

              <div className="flex flex-col gap-4">
                <div className="flex flex-row items-center justify-between">
                  <span className="text-text-primary typo-callout">
                    New user welcome
                  </span>
                  <Switch
                    inputId="new-user-welcome"
                    name="new-user-welcome"
                    checked={newUserWelcome}
                    onToggle={() => setNewUserWelcome(!newUserWelcome)}
                    compact={false}
                  />
                </div>
                <p className="text-text-tertiary typo-footnote">
                  Get helpful tips and guidance as you get started with
                  daily.dev.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-row items-center justify-between">
                  <span className="text-text-primary typo-callout">
                    Major announcements
                  </span>
                  <Switch
                    inputId="major-announcements"
                    name="major-announcements"
                    checked={majorAnnouncements}
                    onToggle={() => setMajorAnnouncements(!majorAnnouncements)}
                    compact={false}
                  />
                </div>
                <p className="text-text-tertiary typo-footnote">
                  Get notified about big product changes, launches, and
                  important company news from daily.dev.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-row items-center justify-between">
                  <span className="text-text-primary typo-callout">
                    Community & Marketing
                  </span>
                  <Switch
                    inputId="community-marketing"
                    name="community-marketing"
                    checked={communityMarketing}
                    onToggle={() => setCommunityMarketing(!communityMarketing)}
                    compact={false}
                  />
                </div>
                <p className="text-text-tertiary typo-footnote">
                  Get emails about product news, events, giveaways, and
                  highlights from the daily.dev community.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-row items-center justify-between">
                  <span className="text-text-primary typo-callout">
                    Critical system alerts
                  </span>
                  <Switch
                    inputId="critical-system-alerts"
                    name="critical-system-alerts"
                    checked={criticalSystemAlerts}
                    onToggle={() => {}}
                    compact={false}
                    disabled
                  />
                </div>
                <p className="text-text-tertiary typo-footnote">
                  Get important emails about account security, privacy updates,
                  and critical system issues.
                </p>
              </div>
            </div>

            <HorizontalSeparator />

            {/* Advanced */}
            <div className="flex flex-col gap-5">
              <h3 className="font-bold text-text-primary typo-body">
                Advanced
              </h3>

              <div className="flex flex-row items-center justify-between">
                <span className="text-text-primary typo-callout">
                  Unsubscribe from all email notifications
                </span>
                <Switch
                  inputId="unsubscribe-all"
                  name="unsubscribe-all"
                  checked={unsubscribeAll}
                  onToggle={() => setUnsubscribeAll(!unsubscribeAll)}
                  compact={false}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsForm;
