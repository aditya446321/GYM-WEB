# FIT CULTURE — Gym Management System

Custom Firebase-ready gym management web app. No poster or external image dependency.

## Firebase
The Web App configuration is already placed in `js/app.js` from the configuration supplied for this project.

1. Firebase Authentication → Sign-in method → Email/Password → Enable.
2. Firestore Database → Create database.
3. Create an Authentication user.
4. In Firestore create `users/{AUTH_UID}` with `name` and `role` (`admin`, `trainer`, or `client`).
5. Publish `firestore.rules` in Firebase.

For client login, create a Firestore `clients` document with `userId` equal to that Firebase Authentication UID.

## Hosting
This is a static site. It can be hosted on Firebase Hosting, Vercel, Netlify, GitHub Pages, or another static host.

## Note
Firebase Web configuration values are intended for client-side use. Never put a Firebase service-account private key in this project.
