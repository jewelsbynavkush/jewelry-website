# Quick Start Guide

Get the project running locally in a few minutes.

## Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free tier) or local MongoDB

## Steps

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values. Minimum for local dev:

- `NEXT_PUBLIC_ENV=development`
- `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
- `NEXT_PUBLIC_SITE_NAME=Jewels by NavKush`
- `MONGODB_URI` – your MongoDB connection string
- `JWT_SECRET` – at least 32 characters

See [Environment Variables Complete](./ENVIRONMENT_VARIABLES_COMPLETE.md) for the full list.

### 3. Database setup

- **MongoDB Atlas:** [MongoDB Atlas Complete Guide](./MONGODB_ATLAS_COMPLETE_GUIDE.md) – create a cluster and get your URI.
- After first run, seed site settings: `npm run migrate:site-settings`

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Next steps

- [Environment Setup Guide](./ENVIRONMENT_SETUP_GUIDE.md) – full dev/prod setup
- [Development Guide](./DEVELOPMENT_GUIDE.md) – workflow and scripts
- [API Guide](./API_GUIDE.md) – API usage and reference
