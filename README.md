# FIT CULTURE — Gym Management System

A custom Firebase-ready gym management web app built without Lovable.

## Included
- Premium FIT CULTURE dark/lime responsive interface
- Firebase Email/Password login
- Role-based Admin / Trainer / Client workspaces
- Admin dashboard, client directory, trainer roster, memberships, payments and reviews
- Add/edit/delete client records
- Add trainers, memberships and payment records
- Trainer assigned-client workspace and session completion
- Client dashboard, profile, sessions, payments and review submission
- Firestore security rules

## Firebase setup
1. Firebase Console → Authentication → Sign-in method → enable Email/Password.
2. Firebase Console → Firestore Database → Create database.
3. Project Settings → Your apps → Web app.
4. The supplied Firebase web configuration is already placed in `js/app.js`.
5. Create an Authentication user for the gym admin.
6. In Firestore create `users/{AUTH_USER_UID}` with:
   `{ "name": "FIT CULTURE Admin", "role": "admin" }`
7. Publish `firestore.rules` from this folder in Firestore Rules.
8. Deploy the folder to Vercel/Netlify/GitHub Pages.

For trainers/clients, create their Authentication accounts and then create matching `users/{UID}` documents. Link a client record with `userId` equal to the client's Firebase Authentication UID. Link trainer-owned client records with `trainerId` equal to the trainer's Firebase Authentication UID.

## Collections
- users
- clients
- trainers
- memberships
- payments
- sessions
- reviews

## Important
The website does not display Firebase configuration, Storage, database setup details, or developer instructions to gym users. Firebase is only the backend layer.
