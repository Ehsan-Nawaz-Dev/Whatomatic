# Whatomatic Admin Panel

This is a standalone admin dashboard for managing Whatomatic merchants and monitoring global activity.

## Structure
- `/` - React + Vite Frontend
- `/backend` - Node.js + Express + MongoDB Backend

## Setup & Running

### 1. Run the Backend
1. Open a terminal: `cd backend`
2. Install dependencies: `npm install`
3. Start the server: `npm run start` (Starts on port 5001)

### 2. Run the Frontend
1. Open a new terminal: `cd ..` (Back to root)
2. Install dependencies: `npm install`
3. Start Vite: `npm run dev`

## Database
Both the admin panel and the main Whatflow app connect to the **same MongoDB database**. Any changes made here (plans, trial limits) will reflect immediately for the merchants.
