# Database Migrations

This directory contains all SQL migrations for the Diktalo database.

## Migration Files

### Structure

Migrations follow this naming convention:
```
YYYYMMDD_description_of_change.sql
```

### How to Apply Migrations

#### Via Supabase CLI (Recommended)

```bash
# Link to your project
npx supabase link --project-ref qnvzofpdrfzchsegooic

# Push all pending migrations
npx supabase db push
```

#### Via Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/qnvzofpdrfzchsegooic/sql/new
2. Copy the SQL from the migration file
3. Paste and click **Run**

## Current Migrations

### `20260202_add_language_to_profiles.sql`

**Purpose:** Add bilingual support (ES/EN) for emails

**Changes:**
- Adds `language VARCHAR(2)` column to `profiles` table
- Sets default to `'es'` (Spanish)
- Updates existing users to Spanish

**Applied:** ✅ / ❌

---

## Creating New Migrations

1. Create a new file: `supabase/migrations/YYYYMMDD_your_change.sql`
2. Write your SQL (DDL only - no data changes in production)
3. Test locally if possible
4. Apply to production via CLI or dashboard
5. Mark as applied in this README

---

## Rollback

If a migration fails:

```sql
-- Manually revert changes
-- Example for language column:
ALTER TABLE profiles DROP COLUMN IF EXISTS language;
```

---

## Best Practices

- ✅ Use `IF NOT EXISTS` / `IF EXISTS` for idempotency
- ✅ Test on local/dev environment first
- ✅ Include comments explaining complex changes
- ✅ Keep migrations small and atomic
- ❌ Never delete migration files - only add new ones
