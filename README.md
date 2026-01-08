# DialDrill - AI Sales Call Simulator

Practice objection handling with AI-powered sales call simulations.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create `.env.local` with your keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...
WEBHOOK_SECRET=whsec_...
```

### 3. Configure Clerk Webhook (Important!)
1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Subscribe to: `user.created`
4. Copy signing secret to `.env.local` as `WEBHOOK_SECRET`

For local testing, use [ngrok](https://ngrok.com):
```bash
ngrok http 3000
# Use the HTTPS URL in Clerk webhook settings
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Font Note (no external fetch)
- We removed Google Fonts. The app now uses a local/system font stack via Tailwind `font-sans`.
- Nothing to download; builds work offline/network-restricted environments.
- The root layout and globals already point to the system stack—no extra config needed.

## Features

- ✅ Clerk authentication (sign-up/sign-in)
- ✅ Neon PostgreSQL database integration
- ✅ User dashboard with free call tracking
- ✅ Modern dark UI with cyan accents
- 🚧 AI voice call simulation (coming soon)
- 🚧 Real-time feedback (coming soon)
- 🚧 Call recordings & transcripts (coming soon)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: Clerk
- **Database**: Neon PostgreSQL
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Documentation

See [SETUP.md](./SETUP.md) for detailed setup instructions and troubleshooting.

## Project Structure

```
/app
  /dashboard       # Protected user dashboard
  /api
    /user/calls    # User data endpoints
    /webhooks      # Clerk webhooks
/lib
  /db.ts          # Database connection
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

Private - All rights reserved
