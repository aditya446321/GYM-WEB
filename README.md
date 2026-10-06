# FIT CULTURE — Gym Management System

A Firebase-ready gym management dashboard built without Lovable. It implements the roles and modules from the supplied specification:
- Admin: clients, trainers, memberships, payments, reviews, dashboard
- Trainer: assigned clients and sessions
- Client: profile, membership/PT details, sessions, payments, review
- Firebase Authentication + Firestore
- Responsive dark / lime premium UI

## Run
This is a static app. You can deploy the folder directly to Vercel/Netlify/GitHub Pages.
For local testing, use any static server (for example VS Code Live Server).

## Firebase setup
1. Firebase Console → Create project.
2. Build → Authentication → Sign-in method → enable Email/Password.
3. Build → Firestore Database → Create database.
4. Project settings → Your apps → Web app → register app.
5. Copy the Firebase config into `js/app.js`.
6. In Authentication → Users, create your first admin email/password.
7. In Firestore create collection `users`, with document ID equal to that Firebase user's UID:
   { "name": "Gym Admin", "role": "admin" }
8. Deploy the site.
9. Create trainer/client Auth accounts in Firebase and add matching `users` documents:
   trainer: {name, role:"trainer"}
   client: {name, role:"client"}
10. Add records to `clients`, `trainers`, `memberships`, `payments`, `sessions`, `reviews`.

Important: do NOT put a service-account private key in this frontend. Firebase web config is okay to expose; Firestore Security Rules must enforce access.

## Firestore fields used by this starter
clients: name, clientNumber, phone, address, membership, membershipExpiry, membershipStart, ptPlan, trainer, trainerId, sessionsCompleted, pendingSessions, carryForward, expectedPayment, paymentDueDate, gymTiming, status, userId, email
trainers: name, speciality, phone, status
memberships: clientName, plan, startDate, expiryDate, status
payments: clientName, clientId, clientEmail, amount, dueDate, status, note
sessions: clientName, trainerId, date, type, status
reviews: clientId, clientName, rating, text, createdAt
users: name, role
