"use client";

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "@/lib/firebase";

export default function PushNotificationManager() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function requestPermission() {
      if (typeof window !== "undefined" && "Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          try {
            if (messaging) {
              const currentToken = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
              });
              
              if (currentToken) {
                console.log("FCM Token:", currentToken);
                setToken(currentToken);
                // Here you would typically send this token to your backend
                // to save it for this specific user so you can push notifications to them.
              } else {
                console.log("No registration token available. Request permission to generate one.");
              }
            }
          } catch (err) {
            console.error("An error occurred while retrieving token. ", err);
          }
        } else {
          console.log("User denied notification permission.");
        }
      }
    }

    requestPermission();
  }, []);

  return null; // This component handles background setup, nothing to render
}
