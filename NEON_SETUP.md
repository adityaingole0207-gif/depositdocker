# Neon PostgreSQL Setup Guide for DepositLocker

## Step 1 — Create a Free Neon Account

1. Go to **https://neon.tech** → click **"Sign Up"** → sign in with GitHub
2. Create a new project: name it `depositlocker`, region **Asia Pacific (Singapore)** or the closest to you
3. Neon will provision a database and show you a **connection string** like:
   ```
   postgresql://depositlocker_owner:XXXXXXXXXXXX@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **Copy this full connection string** — you'll need it in two places below.

---

## Step 2 — Update your local `.env` file

Edit `c:\Users\ingol\Downloads\deposit\.env` and replace the DATABASE_URL line:

```env
DATABASE_URL="postgresql://depositlocker_owner:XXXXXXXXXXXX@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="depositlocker-super-secret-jwt-key-2026-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## Step 3 — Push the schema and seed the database

Run these commands in order in your terminal (`c:\Users\ingol\Downloads\deposit`):

```powershell
# Generate Prisma client for PostgreSQL
npx.cmd prisma generate

# Push schema to Neon (creates all tables)
npx.cmd prisma db push

# Seed the database with all demo data
npm.cmd run seed
```

---

## Step 4 — Update Vercel Environment Variables

1. Go to **https://vercel.com/dashboard** → your `depositdocker` project → **Settings** → **Environment Variables**
2. Add/update these variables:
   - `DATABASE_URL` = your Neon connection string
   - `JWT_SECRET` = `depositlocker-super-secret-jwt-key-2026-production`
   - `NEXT_PUBLIC_APP_URL` = `https://depositdocker.vercel.app`
3. Click **Save** for each

---

## Step 5 — Redeploy on Vercel

Either push a new commit, or go to Vercel → **Deployments** → click **Redeploy** on the latest deployment.

---

## Verification

After redeployment, test at https://depositdocker.vercel.app:
- Login with `demo@depositlocker.com` / `demo123`
- Check that rooms, reports, and insights all load with real data

---

> **Note:** The Neon free tier gives you 512 MB storage and 191.9 compute hours/month — more than enough for a demo/portfolio project.
