import React, { useEffect, useRef } from "react";
import { useAuthStore } from "../lib/store";
import { usePushSubscribe, useVapidKey } from "../hooks/queries";

/**
 * PushNotificationManager Component
 * 
 * Handles:
 * - Service Worker registration
 * - Push notification subscription
 * - Keeps user subscribed across sessions
 */
export default function PushNotificationManager() {
  const { isAuthenticated } = useAuthStore();
  const { data: vapidKeyData } = useVapidKey();
  const { mutate: subscribe } = usePushSubscribe();
  const subscribedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated || subscribedRef.current) {
      return;
    }

    // Only proceed if browser supports service workers and push API
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push notifications not supported in this browser");
      return;
    }

    const initPushNotifications = async () => {
      try {
        // Register service worker
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        console.log("Service Worker registered successfully", registration);

        // Check if already subscribed
        let subscription = await registration.pushManager.getSubscription();

        // If no subscription exists and we have the VAPID key, subscribe
        if (!subscription && vapidKeyData?.vapidPublicKey) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKeyData.vapidPublicKey),
          });

          // Send subscription to server
          if (subscription) {
            subscribe(subscription.toJSON());
            subscribedRef.current = true;
          }
        } else if (subscription) {
          // Already subscribed, just inform the server
          subscribe(subscription.toJSON());
          subscribedRef.current = true;
        }
      } catch (error) {
        console.error("Failed to set up push notifications:", error);
      }
    };

    initPushNotifications();
  }, [isAuthenticated, vapidKeyData, subscribe]);

  return null;
}

/**
 * Helper function to convert VAPID public key from base64 to Uint8Array
 * Required by the Push API
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
