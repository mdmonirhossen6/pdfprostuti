# Prostuti BD

An Astro site for managing study resources, PDFs, and SEO-ready blog posts. This project is deployed to Vercel and uses Supabase for storage and database.

## Admin features

- Dashboard for published and draft content
- Rich post editor with SEO, FAQ schema, and app/Telegram promotion controls
- Resource metadata: chapter/topic, PDF type, academic year, license, source, status
- Contextual app CTAs to `https://web.prostuti.bd` with UTM tags (HSC→practice, Admission→model-test, BCS→question-bank)
- Direct PDF and cover-image uploads to Supabase Storage
- Dedicated PDF library for getting a shareable file link before creating a post

## Database migration

Apply migrations in Supabase (SQL editor or CLI):

```text
supabase/migrations/20260729_resource_fields.sql
supabase/migrations/20260729_tracking_events.sql
```

## Event tracking

- Public client posts to `POST /api/track` with `type: "download" | "cta"`
- Events store resource id, exam/subject, device, referral, destination URL, and UTM fields
- Admin conversion dashboard: `/admin/analytics`

## Required environment variables

Configure these variables in Vercel (Project Settings → Environment Variables) and in your local `.env`/`.dev.vars` for local development:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=resources
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-admin-password
SESSION_SECRET=a-long-random-secret
```

Create the `resources` bucket in Supabase Storage and make it public when you want direct download URLs. The service role key must remain server-side; never prefix it with `PUBLIC_`.

## Commands

```sh
npm install
npm run dev
npm run build
```

## Notes about deployment

- This project uses the Vercel adapter for Astro. Ensure `@astrojs/vercel` is installed (devDependency) and `astro.config.mjs` uses `adapter: vercel()`.
- Commit your `package-lock.json` (or `pnpm-lock.yaml`) after running `npm install` locally so Vercel installs the exact dependency tree during builds.
- If you encounter peer dependency errors during Vercel builds, run `npm install` locally and commit the generated lockfile, or temporarily use the Build Command `npm install --legacy-peer-deps && npm run build` in Vercel settings while you fix versions.
