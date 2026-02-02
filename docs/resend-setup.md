# Resend Email Integration Setup

Complete guide for setting up bilingual transactional emails.

## Prerequisites

- Resend account (https://resend.com)
- API key: `re_NCbsjjXj_F2CnN7SAKCHRqAGmNafcgWiv` ✅
- Supabase project access

## Step 1: Apply Database Migration

```bash
npx supabase db push --project-ref qnvzofpdrfzchsegooic
```

Or manually run: `supabase/migrations/20260202_add_language_to_profiles.sql`

## Step 2: Configure Supabase Secret

```bash
npx supabase secrets set RESEND_API_KEY=re_NCbsjjXj_F2CnN7SAKCHRqAGmNafcgWiv --project-ref qnvzofpdrfzchsegooic
```

## Step 3: Deploy Webhook

```bash
npx supabase functions deploy lemon-webhook --project-ref qnvzofpdrfzchsegooic --no-verify-jwt
```

## Step 4: Verify Domain (Optional but Recommended)

1. Go to Resend dashboard → Domains
2. Add `diktalo.com`
3. Add DNS records provided by Resend
4. Wait for verification (~30 minutes)

**Until verified, emails send from:** `onboarding@resend.dev`

## Email Templates

Located in: `supabase/functions/lemon-webhook/email-templates.ts`

### Supported Events

| Event | Trigger | Language Support |
|-------|---------|------------------|
| Welcome | `subscription_created` | ES/EN |
| Plan Change | `subscription_updated` | ES/EN |
| Cancellation | `subscription_cancelled` | ES/EN |

## Testing

1. Go to Lemon Squeezy → Webhooks
2. Resend a previous event
3. Check Resend dashboard: https://resend.com/emails
4. Verify email arrives in inbox

## Monitoring

- **Resend Dashboard:** https://resend.com/emails
- **Webhook Logs:** Check Supabase Function logs
- **Database:** Query `profiles.language` to verify user preferences

## Troubleshooting

### Emails not sending?

1. Verify secret is set: `npx supabase secrets list --project-ref qnvzofpdrfzchsegooic`
2. Check webhook logs for errors
3. Verify Resend API key is active

### Wrong language?

Update user language:
```sql
UPDATE profiles SET language = 'en' WHERE email = 'user@example.com';
```

## Cost

- **Free tier:** 3,000 emails/month
- **Estimated usage:** ~80-100 emails/month
- **Well within free tier** ✅
