# OT Entry Tracker - Blinkit Internal Tool

A simple, clean web application for tracking overtime (OT) entries for captains. Built with Next.js, TypeScript, Tailwind CSS, and Firebase Firestore.

## Features

- **User Form**: Submit OT entries with captain details, purpose, and overtime data
- **Admin Panel**: Secure login to view and manage all OT entries
- **Dashboard**: Grouped view by captain name with automatic hour calculation and totals
- **Search/Filter**: Quickly find entries by captain name
- **Responsive Design**: Works on both mobile and desktop
- **Secure**: Protected admin routes with session-based authentication

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Deployment**: Vercel-ready

## Project Structure

```
blinkit/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Admin login page
│   ├── api/
│   │   ├── login/
│   │   │   └── route.ts      # Login API endpoint
│   │   ├── logout/
│   │   │   └── route.ts      # Logout API endpoint
│   │   ├── submit-ot/
│   │   │   └── route.ts      # Submit OT entry API
│   │   └── ot-entries/
│   │       └── route.ts      # Fetch OT entries API
│   ├── dashboard/
│   │   └── page.tsx          # Admin dashboard with grouped data
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page with OT form
├── lib/
│   └── firebase.ts           # Firebase configuration
├── middleware.ts             # Route protection middleware
└── firebase-config.example.ts # Environment variables template
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- A Firebase project (free tier works)

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Firestore Database:
   - Go to Build → Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" (for development)
4. Get your Firebase configuration:
   - Go to Project Settings → General → Your apps
   - Click the web icon (</>)
   - Register the app
   - Copy the firebaseConfig object

### 3. Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy these from your Firebase Console
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Note**: See `firebase-config.example.ts` for the template.

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### For Captains (Submitting OT)

1. Navigate to the home page (`/`)
2. Fill in the form:
   - **Captain ID**: Enter your ID
   - **Captain Name**: Enter your full name
   - **Purpose of OT**: Select PUTAWAY, PICKING, or AUDIT
   - **OT Entry**: Enter in format "DD MONTH - X HR OT" (e.g., "12 March - 3 HR OT")
3. Click "Submit" to save the entry

### For Admins (Viewing Data)

1. Navigate to `/admin`
2. Login with credentials:
   - **ID**: `user_blinkit`
   - **Password**: `Blinkit`
3. View the dashboard with:
   - All entries grouped by captain name
   - Total hours per captain
   - Search/filter by name
   - Overall statistics

## Deployment to Vercel

### Option 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Add all Firebase environment variables from `.env.local`

### Option 2: Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel](https://vercel.com/new)
3. Import your repository
4. Add environment variables in the deployment settings
5. Click "Deploy"

### Environment Variables on Vercel

Add these in your Vercel project settings:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## API Endpoints

### POST `/api/submit-ot`
Submit a new OT entry.

**Body:**
```json
{
  "captainId": "CAP001",
  "captainName": "John Doe",
  "purpose": "PUTAWAY",
  "otEntry": "12 March - 3 HR OT"
}
```

### POST `/api/login`
Admin login.

**Body:**
```json
{
  "id": "user_blinkit",
  "password": "Blinkit"
}
```

### POST `/api/logout`
Admin logout (requires authentication).

### GET `/api/ot-entries`
Fetch all OT entries (requires authentication).

## Security Notes

- Admin credentials are hardcoded in the API route (`/api/login/route.ts`)
- In production, consider:
  - Using Firebase Authentication
  - Implementing proper password hashing
  - Using environment variables for credentials
  - Adding rate limiting

## Data Processing

The application automatically:
- Extracts hours from OT entry text (e.g., "3 HR" → 3)
- Groups entries by captain name
- Calculates total hours per captain
- Displays summaries in the dashboard

## Troubleshooting

### Firebase Connection Issues
- Verify all environment variables are set correctly
- Check Firestore rules in Firebase Console
- Ensure your Firebase project has Firestore enabled

### Deployment Issues
- Make sure all environment variables are added to Vercel
- Check the deployment logs in Vercel dashboard
- Ensure the build completes successfully

### Admin Login Not Working
- Clear browser cookies and try again
- Check that the session cookie is being set correctly
- Verify the middleware is running properly

## License

This is an internal tool for Blinkit.
