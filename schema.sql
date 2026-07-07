-- ==========================================
-- 1. CREATE TABLES AND UPDATE COLUMNS IF NOT EXISTS
-- ==========================================

-- Add status column to cars table if it doesn't exist
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published'));

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Blogs Table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    seo_title TEXT,
    seo_description TEXT,
    image TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    author TEXT DEFAULT 'budgetev-team',
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- News Table
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    seo_title TEXT,
    seo_description TEXT,
    image TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    author TEXT DEFAULT 'budgetev-team',
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Website Settings Table
CREATE TABLE IF NOT EXISTS public.website_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    website_name TEXT DEFAULT 'Budget EV',
    logo TEXT,
    favicon TEXT,
    footer TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    seo_defaults JSONB DEFAULT '{}'::jsonb,
    google_analytics TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AI Settings Table
CREATE TABLE IF NOT EXISTS public.ai_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    welcome_message TEXT DEFAULT 'Hello! I am your BudgetEV assistant. Ask me anything about electric cars.',
    suggested_questions JSONB DEFAULT '[]'::jsonb,
    system_prompt TEXT DEFAULT 'You are a helpful EV expert assistant.',
    temperature NUMERIC DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    gemini_model TEXT DEFAULT 'gemini-1.5-flash',
    enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default row for website_settings and ai_settings if not present
INSERT INTO public.website_settings (id, website_name) 
VALUES ('default', 'Budget EV') 
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ai_settings (id) 
VALUES ('default') 
ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 3. DEFINE POLICIES FOR TABLES
-- ==========================================

-- --- CARS POLICIES ---
DROP POLICY IF EXISTS "Allow public read access to published cars" ON public.cars;
CREATE POLICY "Allow public read access to published cars" 
ON public.cars FOR SELECT 
TO public 
USING (status = 'published');

DROP POLICY IF EXISTS "Allow authenticated admin CRUD on cars" ON public.cars;
CREATE POLICY "Allow authenticated admin CRUD on cars" 
ON public.cars FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- --- BLOGS POLICIES ---
DROP POLICY IF EXISTS "Allow public read access to published blogs" ON public.blogs;
CREATE POLICY "Allow public read access to published blogs" 
ON public.blogs FOR SELECT 
TO public 
USING (status = 'published');

DROP POLICY IF EXISTS "Allow authenticated admin CRUD on blogs" ON public.blogs;
CREATE POLICY "Allow authenticated admin CRUD on blogs" 
ON public.blogs FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- --- NEWS POLICIES ---
DROP POLICY IF EXISTS "Allow public read access to published news" ON public.news;
CREATE POLICY "Allow public read access to published news" 
ON public.news FOR SELECT 
TO public 
USING (status = 'published');

DROP POLICY IF EXISTS "Allow authenticated admin CRUD on news" ON public.news;
CREATE POLICY "Allow authenticated admin CRUD on news" 
ON public.news FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- --- WEBSITE SETTINGS POLICIES (OWNER) ---
DROP POLICY IF EXISTS "Allow public read access to website settings" ON public.website_settings;
CREATE POLICY "Allow public read access to website settings" 
ON public.website_settings FOR SELECT 
TO public 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to update website settings" ON public.website_settings;
CREATE POLICY "Allow authenticated users to update website settings" 
ON public.website_settings FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- --- AI SETTINGS POLICIES ---
DROP POLICY IF EXISTS "Allow public read access to ai settings" ON public.ai_settings;
CREATE POLICY "Allow public read access to ai settings" 
ON public.ai_settings FOR SELECT 
TO public 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to update ai settings" ON public.ai_settings;
CREATE POLICY "Allow authenticated users to update ai settings" 
ON public.ai_settings FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- --- ACTIVITY LOGS POLICIES ---
DROP POLICY IF EXISTS "Allow authenticated admin to view activity logs" ON public.activity_logs;
CREATE POLICY "Allow authenticated admin to view activity logs" 
ON public.activity_logs FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated admin to insert activity logs" ON public.activity_logs;
CREATE POLICY "Allow authenticated admin to insert activity logs" 
ON public.activity_logs FOR INSERT 
TO authenticated 
WITH CHECK (true);


-- ==========================================
-- 4. STORAGE POLICY INSTRUCTIONS (FOR SUPABASE DASHBOARD)
-- ==========================================
-- Make sure to create the public buckets in your Supabase Dashboard:
-- 1. 'cars'
-- 2. 'car-interior' (new interior bucket)
-- 3. 'blogs'
-- 4. 'news'
-- 5. 'logos'
-- 6. 'favicons'
-- 7. 'media' (general bucket)
--
-- For each bucket, run policies like:
-- CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'bucketname');
-- CREATE POLICY "Allow authenticated users to upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'bucketname');
-- CREATE POLICY "Allow authenticated users to update/delete" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'bucketname');

-- ==========================================
-- 5. CAR IMAGE MANAGEMENT MIGRATIONS (REVISED)
-- ==========================================
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS vehicle_thumbnail TEXT;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS exterior_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS interior_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS seo_description TEXT;
