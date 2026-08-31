-- ==============================================================================
-- Schema khởi tạo Database PostgreSQL trên Supabase cho AI Tech News Digest
-- ==============================================================================

-- 1. Tạo bảng lưu trữ tin tức
CREATE TABLE IF NOT EXISTS public.news (
    id TEXT PRIMARY KEY,
    title_vi TEXT NOT NULL,
    title_en TEXT NOT NULL,
    summary_vi JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary_en JSONB NOT NULL DEFAULT '[]'::jsonb,
    original_title TEXT,
    url TEXT UNIQUE NOT NULL,
    source_name TEXT NOT NULL,
    source_origin TEXT NOT NULL CHECK (source_origin IN ('vietnam', 'global')),
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    hot_score INTEGER DEFAULT 80 CHECK (hot_score >= 1 AND hot_score <= 100),
    read_time_minutes INTEGER DEFAULT 3,
    thumbnail_url TEXT,
    content_snippet TEXT,
    author_name TEXT,
    author_avatar TEXT,
    upvotes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Đánh chỉ mục (Indexes) tối ưu hóa truy vấn tốc độ cao
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news (category);
CREATE INDEX IF NOT EXISTS idx_news_source_origin ON public.news (source_origin);
CREATE INDEX IF NOT EXISTS idx_news_hot_score ON public.news (hot_score DESC);

-- 3. Cấu hình Row Level Security (RLS) - Cho phép đọc công khai không cần login
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép tất cả mọi người đọc tin tức công khai"
ON public.news
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Chỉ Service Role / Crawler mới có quyền ghi tin tức"
ON public.news
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
