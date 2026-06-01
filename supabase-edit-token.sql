-- 为 profile 管理添加编辑 token 字段
ALTER TABLE trustlink_profiles
  ADD COLUMN IF NOT EXISTS edit_token TEXT,
  ADD COLUMN IF NOT EXISTS edit_token_expires_at TIMESTAMPTZ;

-- 加索引，方便按 token 查询
CREATE INDEX IF NOT EXISTS idx_trustlink_profiles_edit_token
  ON trustlink_profiles (edit_token)
  WHERE edit_token IS NOT NULL;

-- 身份验证标记
ALTER TABLE trustlink_profiles
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
