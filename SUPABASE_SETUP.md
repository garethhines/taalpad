# Supabase Setup Guide

Follow these steps to connect Taalpad to your Supabase project.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Choose a name (e.g. `taalpad`), a strong database password, and a region close to your users.
4. Wait ~2 minutes for provisioning.

---

## 2. Set your environment variables

Copy the example file and fill in your keys:

```bash
cp .env.local.example .env.local
```

In your Supabase project go to **Settings → API** and copy:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key *(keep secret — never expose to the browser)* |

Your `.env.local` should look like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3. Run the migrations

### Option A — Supabase Dashboard (quickest)

1. In your project, go to **SQL Editor → New query**.
2. Paste the contents of `supabase/migrations/001_initial_schema.sql` and click **Run**.
3. Paste the contents of `supabase/migrations/002_rls_policies.sql` and click **Run**.

### Option B — Supabase CLI

```bash
# Install the CLI (if you haven't already)
npm install -g supabase

# Log in
supabase login

# Link your project (find the project ref in Settings → General)
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
```

---

## 4. Verify the schema

In the Supabase dashboard go to **Table Editor** and confirm you see these four tables:

- `users_profile`
- `learning_progress`
- `vocabulary_progress`
- `streak_history`

Go to **Database → Functions** and confirm `handle_new_user` exists.
Go to **Database → Triggers** and confirm `on_auth_user_created` exists.

---

## 5. Configure Auth

In **Authentication → Settings**:

- **Email confirmations** — disable during development for a frictionless signup flow; re-enable before production.
- **Site URL** — set to `http://localhost:3000` for local dev, then update to your production URL before deploying.
- **Redirect URLs** — add `http://localhost:3000/**` (local) and your production domain.

---

## 6. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000/signup](http://localhost:3000/signup) to create your first account. The middleware will redirect unauthenticated visitors to the login page automatically.

---

## Database schema overview

```
users_profile
  id                UUID  PK → auth.users
  display_name      TEXT
  current_level     ENUM  (A0 | A1 | A2 | B1 | B2)
  total_xp          INT
  current_streak    INT
  longest_streak    INT
  last_activity_date DATE  (used to calculate streak validity)
  created_at        TIMESTAMPTZ

learning_progress
  id           UUID  PK
  user_id      UUID  → users_profile
  unit_id      TEXT  (e.g. "unit-1")
  lesson_id    TEXT  (e.g. "l-1-1")
  status       ENUM  (locked | available | in_progress | completed)
  score        INT?  (0-100, best score)
  completed_at TIMESTAMPTZ?
  attempts     INT

vocabulary_progress
  id               UUID  PK
  user_id          UUID  → users_profile
  word_id          TEXT  (matches id in /data/vocabulary.json)
  familiarity      INT   (0-5, SM-2 scale)
  next_review_date TIMESTAMPTZ
  times_correct    INT
  times_incorrect  INT
  last_reviewed    TIMESTAMPTZ

streak_history
  id                UUID  PK
  user_id           UUID  → users_profile
  date              DATE
  xp_earned         INT
  lessons_completed INT
```

### Streak logic

| Scenario | Result |
|---|---|
| `last_activity_date` = today | Streak unchanged (already counted) |
| `last_activity_date` = yesterday | Streak incremented by 1 |
| `last_activity_date` ≥ 2 days ago | Streak resets to 1 |
| No activity yet | Streak starts at 1 on first lesson |

The `getEffectiveStreak()` helper in `lib/streak.ts` also handles display:
if a user's last activity was yesterday and they haven't done anything today,
their streak is shown as still valid (they haven't *missed* today yet).

---

## Useful Supabase CLI commands

```bash
supabase status          # check local Supabase instance
supabase db diff         # see pending schema changes
supabase db reset        # reset local DB to migrations
supabase gen types typescript --project-id <ref> > lib/database.types.ts
```
