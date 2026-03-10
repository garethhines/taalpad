# Deploying Taalpad to Vercel

## Prerequisites

- Supabase project created and all three migrations applied (see `SUPABASE_SETUP.md`)
- GitHub repository: `github.com/garethhines/taalpad`
- Vercel account (free tier is sufficient)

---

## Step 1 — Import the project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Add GitHub Repository"** → select `garethhines/taalpad`
3. Vercel auto-detects **Next.js** — leave all build settings as default:
   - Framework: **Next.js**
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`
4. **Don't deploy yet** — add env vars first (Step 2)

---

## Step 2 — Set environment variables in Vercel

In the Vercel project → **Settings → Environment Variables**, add:

| Name | Value | Environments |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon/public key) | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service_role key) | Production, Preview *(not Development)* |

> **Where to find these:** Supabase Dashboard → Settings → API

> **Security note:** `SUPABASE_SERVICE_ROLE_KEY` is only used server-side and is
> never exposed to the browser. It does NOT need the `NEXT_PUBLIC_` prefix.
> Never add it as `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`.

---

## Step 3 — Deploy

Click **Deploy**. Vercel will:
1. Install dependencies
2. Run `next build` (which also generates `sw.js` and `workbox-*.js` via `next-pwa`)
3. Deploy to a `.vercel.app` URL

First deploy typically takes 2–3 minutes.

---

## Step 4 — Configure Supabase Auth for your production domain

In **Supabase Dashboard → Authentication → URL Configuration**:

| Field | Value |
|-------|-------|
| **Site URL** | `https://taalpad.vercel.app` (or your custom domain) |
| **Redirect URLs** | `https://taalpad.vercel.app/**` |

> If you have a custom domain, use that instead of the `.vercel.app` URL.
> Add both the Vercel URL and your custom domain to Redirect URLs.

---

## Step 5 — Verify the deployment

Visit your deployment URL and check:

- [ ] Login and signup work
- [ ] Dashboard loads with your profile data
- [ ] Learning path shows correctly
- [ ] Flashcard system works
- [ ] Placement test accessible at `/placement`

### PWA check (Chrome DevTools)

1. Open Chrome DevTools → **Application** tab
2. **Manifest** — verify all icons load, `start_url` is `/`, `display` is `standalone`
3. **Service Workers** — status should be **activated and running**
4. **Lighthouse** → run a PWA audit — aim for a green PWA score
5. In Chrome address bar, click the install icon (⊕) to test home-screen install

---

## Custom domain (optional)

In Vercel → **Settings → Domains**:
1. Add your domain (e.g. `taalpad.app`)
2. Follow the DNS instructions to point your domain to Vercel
3. Update Supabase Auth → Site URL to your custom domain

---

## Environment variables for local development

```bash
cp .env.local.example .env.local
# Fill in your values from Supabase Dashboard → Settings → API
```

---

## Re-deploying after changes

Every push to `main` automatically re-deploys via Vercel's GitHub integration.
Pull requests get their own preview URL automatically.

---

## PWA icons

The `public/icons/` directory currently has placeholder icons (solid deep-blue squares).
Replace them with proper branded icons before your public launch.

The two most important sizes:
- **192×192** — used by Android for home screen
- **512×512** — used by Chrome's install prompt and splash screen

To regenerate placeholder icons at any time:
```bash
node scripts/generate-icons.mjs
```

Use a tool like [RealFaviconGenerator](https://realfavicongenerator.net) or
[PWA Builder](https://www.pwabuilder.com/imageGenerator) to create proper branded icons.

---

## Database migrations checklist

Before going to production, confirm all three migrations have been run:

```sql
-- Check in Supabase SQL Editor:
SELECT column_name FROM information_schema.columns
WHERE table_name = 'users_profile'
ORDER BY ordinal_position;
```

You should see: `id`, `display_name`, `current_level`, `total_xp`,
`current_streak`, `longest_streak`, `last_activity_date`, `created_at`, `placement_level`

If `placement_level` is missing, run `supabase/migrations/003_add_placement_level.sql`.

---

## Troubleshooting

**Build fails with `Cannot find module 'next-pwa'`**
→ Run `npm install` locally and push the updated `package-lock.json`

**"Your project's URL and Key are required" error on Vercel**
→ Check the env vars in Vercel Settings — make sure there are no trailing spaces

**Service worker not activating**
→ Clear the browser cache / open in incognito to bypass a stale SW

**Auth redirects not working after login**
→ Verify the Site URL and Redirect URLs in Supabase Auth settings match your Vercel URL exactly (including `https://`)

**PWA "Add to Home Screen" not appearing**
→ The app must be served over HTTPS (Vercel does this automatically), have a valid manifest, and have an active service worker. Run a Lighthouse PWA audit for details.
