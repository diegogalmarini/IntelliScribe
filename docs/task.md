# Call Recording Implementation

## Database Schema
- [x] Create recordings table in Supabase
- [x] Fix FK constraint to reference profiles instead of auth.users

## Backend Implementation
- [x] Modify `/api/voice.ts` to include recording parameters
- [x] Create `/api/recording-callback.ts` webhook handler
- [x] Rewrite callback to use pure fetch API (no Supabase SDK)
- [x] Configure Supabase Storage bucket for recordings
- [/] Test end-to-end recording flow after FK fix

## Audio Issues
- [x] Debug microphone transmission issue
- [x] Remove manual getUserMedia check that interfered with Twilio
- [ ] Verify outbound audio works in test call

## Transcription (Future Phase)
- [ ] Integrate Deepgram/OpenAI for transcription
- [ ] Update recordings table with transcript segments
- [ ] Display transcripts in Dashboard UI
