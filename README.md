# Nutra Web Admin

Next.js web application for the Nutra app - includes a landing page and admin panel for recipe management.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

**Where to find these values:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings > API
4. Copy the values:
   - Project URL -> NEXT_PUBLIC_SUPABASE_URL (and optionally SUPABASE_URL)
   - anon public key -> NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role secret key -> SUPABASE_SERVICE_ROLE_KEY

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

### 4. Access Admin Panel

Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) and sign in with your Supabase user credentials.

## Features

### Admin Panel (`/admin`)

- **Recipe Management**: Create and browse recipes
- **Premium Config**: Update premium configuration settings
- **Authentication**: Secure login with Supabase Auth

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5

## Project Structure

```
nutra-web/
├── app/
│   ├── admin/           # Admin panel page
│   ├── api/admin/       # API routes for admin operations
│   ├── page.tsx         # Landing page
│   └── layout.tsx       # Root layout
├── lib/
│   ├── supabase.ts      # Supabase client configuration
│   └── database.types.ts # TypeScript types for database
├── .env.local           # Environment variables (git-ignored)
└── .env.example         # Example environment variables
```

## Database Schema

The admin panel expects these Supabase tables:

### `recipes`
- `id` (uuid, primary key)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `name` (text, required)
- `description` (text, nullable)
- `ingredients` (text, nullable)
- `instructions` (text, nullable)
- `image_url` (text, nullable)
- `is_premium` (boolean, default: false)

### `premium_config`
- `id` (uuid, primary key)
- `key` (text, unique)
- `value` (jsonb)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Auto-generating TypeScript Types

To auto-generate database types from your Supabase schema:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

Find your project ID in the Supabase Dashboard URL: `https://app.supabase.com/project/<project-id>`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

## Security Notes

- Public site flows use the anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) with RLS
- Only public Supabase credentials are exposed via `NEXT_PUBLIC_` variables
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security (RLS)
- The admin panel uses HTTP-only session cookies for authentication

## License

Private - All rights reserved
