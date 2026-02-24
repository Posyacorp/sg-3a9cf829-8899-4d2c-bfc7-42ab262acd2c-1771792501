# 🚀 Deployment Guide for Sui24

## 1. Prerequisites

- **GitHub Account**: You already have `https://github.com/bitcexio-gif/Sui24`
- **Vercel Account**: [Create one here](https://vercel.com/signup)
- **Supabase Project**: You have `https://bnededqzrhjmgpwmrqew.supabase.co`

## 2. Push Code to GitHub

Since you have the code locally (or in Softgen), you need to push it to your new repository.

```bash
# Initialize git if not done
git init

# Add remote (if not added)
git remote add origin https://github.com/bitcexio-gif/Sui24.git

# Add files
git add .

# Commit
git commit -m "Initial commit - Complete Sui24 Platform"

# Push (force if needed to overwrite empty repo)
git push -u origin main --force
```

## 3. Deploy to Vercel

1.  Go to **[Vercel Dashboard](https://vercel.com/dashboard)**.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository (`Sui24`).
4.  **Configure Project**:
    *   **Framework Preset**: Next.js
    *   **Root Directory**: `./` (default)
5.  **Environment Variables** (Copy from `.env.local`):
    *   `NEXT_PUBLIC_SUPABASE_URL`: `https://bnededqzrhjmgpwmrqew.supabase.co`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Paste your full key)
    *   `NEXT_PUBLIC_SITE_URL`: `https://your-vercel-project-url.vercel.app` (You can update this after deployment)
6.  Click **"Deploy"**.

## 4. Final Supabase Configuration

1.  Go to **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2.  **Site URL**: Set to your Vercel production URL (e.g., `https://sui24.vercel.app`).
3.  **Redirect URLs**: Add `https://sui24.vercel.app/**`.

## 5. Admin Access

To make your user an **Admin**:
1.  Sign up on your live site.
2.  Go to **Supabase Dashboard** -> **Table Editor** -> `profiles`.
3.  Find your user and set `role` to `admin` or `master_admin`.
4.  (Optional) Set `is_admin` to `true` (if column exists, though we migrated to `role`).

## ✅ Done!
Your platform is now live and connected to your production database!