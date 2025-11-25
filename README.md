# AnonBuddy

AnonBuddy is a minimal anonymous matching platform where people share life problems, swipe through others' posts, and connect for one-to-one chats using pseudonyms.

## Project structure
- `server/` – Node.js + Express + TypeScript API with MongoDB/Mongoose models.
- `client/` – React + TypeScript + Vite + Tailwind UI for swiping, posting, and chatting.

## Prerequisites
- Node.js 18+
- MongoDB instance

## Environment variables
Create a `.env` file inside `server/` with:
```
MONGODB_URI=mongodb://localhost:27017/anonbuddy
JWT_SECRET=replace-with-secure-secret
CLIENT_ORIGIN=http://localhost:5173
PORT=4000
# Optional: comma-separated list of admin emails allowed to access the admin console
ADMIN_EMAILS=admin@example.com
```

## Running the server
```
cd server
npm install
npm run dev
```
The API is available at `http://localhost:4000/api`.

## Running the client
```
cd client
npm install
npm run dev
```
Open the Vite dev server (default `http://localhost:5173`). Requests to `/api` are proxied to the server.

## Core flows
- Register/login with email + password; server assigns a random pseudonym.
- Post problems by category.
- Swipe left/right on others' problems; right swipes create matches automatically.
- View matches and chat anonymously.
- Report problems or specific chat messages for moderation.
- Admin console (only for accounts whose email appears in `ADMIN_EMAILS`) to review/resolve reports, force-close matches, and delete abusive accounts.

This prototype is for peer support only and does not replace professional help.
