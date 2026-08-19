# 🧪 Test Plan: Call Recording + Audio Fix

## ✅ Fixes Deployed

### 1. Database FK Constraint
- **Problem**: `recordings.user_id` referenced `auth.users` (invisible to serverless functions)
- **Solution**: Changed FK to reference `public.profiles` instead
- **Status**: ✅ Applied via SQL migration

### 2. Microphone Audio Transmission
- **Problem**: Manual `getUserMedia()` check was stopping the audio stream, preventing outbound audio
- **Solution**: Removed manual check, let Twilio Device handle all audio management
- **Status**: ✅ Deployed to production

---

## 🎯 Test Steps

### Test 1: Verify Recording Storage (FK Fix)

1. **Make a test call**:
   - Go to https://www.diktalo.com
   - Open Dialer (green button)
   - Call: `+34615441301`
   - Stay on call for **20 seconds**
   - Hang up

2. **Wait 90 seconds** for Twilio processing

3. **Check Vercel Logs**:
   - Go to: https://vercel.com/diegos-projects-f7927b35/diktalo/logs
   - Filter: `recording-callback`
   - **Expected**: ✅ Status 200 OK (not 500!)
   - **Screenshot**: Save log details

4. **Check Supabase Storage**:
   - Go to: Storage → `recordings` bucket
   - **Expected**: ✅ New `.mp3` file in your user folder
   - **Screenshot**: Confirm file exists

5. **Check Database**:
   - Go to: Table Editor → `recordings` table
   - **Expected**: ✅ New row with today's date
   - **Screenshot**: Confirm row exists

6. **Check Dashboard**:
   - Go to: https://www.diktalo.com
   - Refresh page
   - **Expected**: ✅ Recording appears in "Recent Recordings"
   - **Screenshot**: Confirm UI shows recording

---

### Test 2: Verify Outbound Audio (Mic Fix)

1. **Make a test call to yourself or a friend**:
   - Call your mobile phone or a friend
   - **Speak clearly** during the call
   - Ask the other person: "Can you hear me?"

2. **Expected Results**:
   - ✅ Other person **CAN hear you** speaking
   - ✅ You can hear the other person (this already worked)
   - ✅ Two-way audio communication works

---

## 📊 Success Criteria

| Check | Expected | Status |
|-------|----------|--------|
| Vercel webhook returns 200 OK | ✅ | ⏳ |
| Audio file in Supabase Storage | ✅ | ⏳ |
| Row in recordings table | ✅ | ⏳ |
| Recording visible in Dashboard | ✅ | ⏳ |
| Outbound audio transmission | ✅ | ⏳ |
| Two-way audio communication | ✅ | ⏳ |

---

## 🐛 If Issues Persist

### Recording Not Saving (500 Error)
- Check Vercel logs for exact error message
- Verify FK constraint was applied: Run SQL query to check constraint definition
- Check Supabase Storage bucket permissions

### Microphone Still Not Working
- Check browser console for Twilio Device errors
- Verify microphone permissions in browser settings
- Try different audio input device (built-in mic vs AirPods)
- Check if browser is blocking microphone access

---

## 📝 Notes

- **AirPods**: Should work fine for both input and output
- **Browser**: Chrome/Edge recommended for best Twilio compatibility
- **Permissions**: Browser will prompt for microphone access on first call
