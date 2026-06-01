-- Run this in your Supabase SQL Editor

-- 1. Create the leads table
CREATE TABLE IF NOT EXISTS seagull_leads (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT,
  wechat      TEXT NOT NULL,
  email       TEXT,
  zip_code    TEXT NOT NULL,
  problem_type TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency     TEXT NOT NULL CHECK (urgency IN ('emergency', '3days', 'week', 'flexible')),
  has_quote   BOOLEAN DEFAULT FALSE,
  budget      TEXT,
  service     TEXT NOT NULL CHECK (service IN ('match', 'quote-review', 'concierge', 'membership')),
  photo_url   TEXT,
  status      TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'matched', 'completed', 'cancelled')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (table is only accessible via service role)
ALTER TABLE seagull_leads ENABLE ROW LEVEL SECURITY;

-- No public access — only your backend (service role key) can insert/read
-- This means: anon users cannot read or write directly to the table

-- 3. Create storage bucket for photos (run once)
-- Go to Supabase Dashboard > Storage > New Bucket
-- Name: seagull-leads
-- Public: YES (so photo URLs work without auth)
-- Max file size: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/heic, video/mp4, video/quicktime
