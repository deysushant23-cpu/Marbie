importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCzBIYqsgYaQLessLcPDla3gxsK1sGAhe0",
  authDomain: "marbie-1600.firebaseapp.com",
  projectId: "marbie-1600",
  storageBucket: "marbie-1600.firebasestorage.app",
  messagingSenderId: "481668471582",
  appId: "1:481668471582:web:8ae0d4bd9e067e526b470f"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.png" // Assumes you have a logo.png in public
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
