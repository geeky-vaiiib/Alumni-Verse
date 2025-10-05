# Migration and Rollback Guide

## Database Migrations

This document describes how to apply and rollback SQL migrations for the AlumniVerse project.

### Migration Files

Located in `supabase/migrations/`:

1. **`001_*.sql`** - Initial schema (profiles, posts, connections, storage)
2. **`002_create_auth_otp.sql`** - OTP authentication table
3. **`003_update_profiles_rls.sql`** - Updated RLS policies for profiles
4. **`004_enable_realtime.sql`** - Enable realtime subscriptions

### Applying Migrations

#### Option 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Link to your project
supabase link --project-ref fpmtzugmvaogxqhetwsj

# Apply all pending migrations
supabase db push

# Or apply a specific migration
supabase db push supabase/migrations/002_create_auth_otp.sql
```

#### Option 2: Using Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/fpmtzugmvaogxqhetwsj/editor
2. Click "SQL Editor"
3. Copy and paste each migration file contents in order
4. Click "RUN" for each migration

#### Option 3: Using psql (Direct Database Access)

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.fpmtzugmvaogxqhetwsj.supabase.co:5432/postgres"

# Then run each migration
\i supabase/migrations/002_create_auth_otp.sql
\i supabase/migrations/003_update_profiles_rls.sql
\i supabase/migrations/004_enable_realtime.sql
```

### Migration Order

**IMPORTANT:** Migrations must be applied in order:

1. First: Ensure 001_*.sql (initial schema) is applied
2. Then: 002_create_auth_otp.sql
3. Then: 003_update_profiles_rls.sql
4. Finally: 004_enable_realtime.sql

### Verifying Migrations

After applying migrations, verify they worked:

```sql
-- Check if auth_otp table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'auth_otp';

-- Check profiles table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name IN ('auth_id', 'is_complete');

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Check realtime publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### Rollback Instructions

#### Rollback Migration 004 (Realtime)

```sql
-- Remove tables from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles;
ALTER PUBLICATION supabase_realtime DROP TABLE public.posts;
ALTER PUBLICATION supabase_realtime DROP TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime DROP TABLE public.connections;
```

#### Rollback Migration 003 (RLS Policies)

```sql
-- Drop new policies
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

-- Remove new columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS auth_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_complete;

-- Recreate original policies (from migration 001)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

#### Rollback Migration 002 (auth_otp)

```sql
-- Drop the auth_otp table and related objects
DROP FUNCTION IF EXISTS public.cleanup_expired_otps();
DROP INDEX IF EXISTS auth_otp_expires_at_idx;
DROP INDEX IF EXISTS auth_otp_email_idx;
DROP TABLE IF EXISTS public.auth_otp;
```

### Common Issues and Solutions

#### Issue: "relation already exists"
**Solution:** The migration was already applied. Check with `\dt auth_otp` to verify.

#### Issue: "permission denied for schema public"
**Solution:** You're not using the service role key. Make sure you're authenticated as postgres user or use Supabase dashboard.

#### Issue: RLS policies conflict
**Solution:** Drop existing policies first:
```sql
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
-- Then rerun the migration
```

#### Issue: Realtime not working after migration
**Solution:** Restart the realtime service or reconnect clients:
```javascript
// In your app, unsubscribe and resubscribe
await supabase.removeAllChannels();
// Then create new subscriptions
```

### Testing Migrations

After applying all migrations, test:

1. **OTP Table:**
   ```sql
   INSERT INTO auth_otp (email, otp_hash, expires_at, purpose)
   VALUES ('test@sit.ac.in', 'test_hash', NOW() + INTERVAL '5 minutes', 'signup');
   
   SELECT * FROM auth_otp WHERE email = 'test@sit.ac.in';
   ```

2. **Profiles RLS:**
   ```sql
   -- As authenticated user (use Supabase client)
   SELECT * FROM profiles WHERE id = auth.uid();
   ```

3. **Realtime:**
   ```javascript
   const channel = supabase.channel('test')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'profiles'
     }, (payload) => console.log(payload))
     .subscribe();
   ```

### Cleanup (Optional)

Remove expired OTPs periodically:

```sql
-- Manual cleanup
DELETE FROM auth_otp WHERE expires_at < NOW() OR used = true;

-- Or use the function
SELECT cleanup_expired_otps();
```

### Production Checklist

Before deploying to production:

- [ ] All migrations applied successfully
- [ ] RLS policies tested for security
- [ ] Realtime subscriptions working
- [ ] OTP table has proper indexes
- [ ] Backup database before migration
- [ ] Test rollback procedure in staging
- [ ] Document any custom modifications
- [ ] Update API documentation

### Getting Help

If migrations fail:

1. Check Supabase dashboard logs
2. Review `supabase/migrations/` for syntax errors
3. Verify database connection
4. Check service role key permissions
5. Contact support: https://supabase.com/support

---

**Last Updated:** 2025-01-05
**Version:** 1.0.0
