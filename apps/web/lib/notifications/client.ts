import {
  markNotificationsRead,
  subscribeToNotifications,
  unsubscribeFromNotifications
} from "./api";

let unreadCount = 0;

function isBrowser() {
  return typeof window !== "undefined";
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!isBrowser() || typeof Notification === "undefined") {
    return "denied";
  }

  if (Notification.permission !== "default") {
    return Notification.permission;
  }

  return Notification.requestPermission();
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isBrowser() || !("serviceWorker" in navigator)) {
    return null;
  }

  return navigator.serviceWorker.register("/sw.js");
}

export async function subscribeToPush(options?: {
  applicationServerKey?: string | ArrayBufferLike;
}) {
  const permission = await requestPermission();
  if (permission !== "granted") {
    return null;
  }

  const registration = await registerServiceWorker();
  if (!registration) {
    return null;
  }

  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    return existing;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: options?.applicationServerKey
  });

  try {
    await subscribeToNotifications(subscription.toJSON());
  } catch (error) {
    console.error("Failed to register push subscription", error);
  }

  return subscription;
}

export async function unsubscribeFromPush() {
  if (!isBrowser() || !("serviceWorker" in navigator)) {
    return false;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    return false;
  }

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    return true;
  }

  const subscriptionJson = subscription.toJSON();
  const unsubscribed = await subscription.unsubscribe();

  try {
    await unsubscribeFromNotifications(subscriptionJson);
  } catch (error) {
    console.error("Failed to unregister push subscription", error);
  }

  return unsubscribed;
}

export function getUnreadCount() {
  return unreadCount;
}

export async function markAllRead() {
  unreadCount = 0;
  try {
    await markNotificationsRead();
  } catch (error) {
    console.error("Failed to mark notifications as read", error);
  }
  return unreadCount;
}

export function incrementUnread(by = 1) {
  unreadCount = Math.max(0, unreadCount + by);
  return unreadCount;
}

export function setUnreadCount(count: number) {
  unreadCount = Math.max(0, count);
  return unreadCount;
}
