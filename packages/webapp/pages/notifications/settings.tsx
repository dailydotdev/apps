// Duplicate route for the notification settings page under the Notifications
// category path. Reuses the exact same page component (and its getLayout /
// layoutProps) as /settings/notifications, but the /notifications/* path keeps
// the Notifications rail panel active. The canonical /settings/notifications
// page keeps the Settings panel.
export { default } from '../settings/notifications';
