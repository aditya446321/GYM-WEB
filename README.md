# FIT CULTURE Gym Management

Custom Firebase-ready gym management web app. No website builder required.

## Firebase setup
1. Firebase Console → Authentication → Sign-in method → enable Email/Password.
2. Firebase Console → Firestore Database → Create database.
3. Create an Authentication user for the first admin.
4. Copy that user's UID.
5. Firestore → collection `users` → document ID = that UID.
6. Add fields:
   - `name`: `FIT CULTURE Admin`
   - `role`: `admin`
7. Open the site and sign in with that Firebase Authentication email/password.

## Other roles
Create a Firebase Authentication user, then add a `users/{UID}` document with:
- `name`: person's name
- `role`: `trainer` or `client`

For a client, create a document in `clients` with the same `email` as the Firebase Authentication account, or set `userId` to the Firebase UID.

## Firestore collections used
`users`, `clients`, `trainers`, `memberships`, `payments`, `sessions`, `reviews`.

## Notes
- The Firebase web configuration is in `js/app.js`.
- Do not put a Firebase service-account private key in the website.
- Deploy the folder as a static site or use any static hosting service.
