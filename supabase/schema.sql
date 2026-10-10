-- ==============================================================================
-- Nyaya Now: Supabase Schema & Row-Level Security (RLS) Configuration
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- to configure the private evidence storage bucket and secure database tables.

-- 1. Create the Evidence Records Table
CREATE TABLE IF NOT EXISTS public.evidence_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
    evidence_type TEXT NOT NULL DEFAULT 'document',
    sha256_hash TEXT,
    extracted_text TEXT,
    ocr_confidence NUMERIC,
    entities JSONB DEFAULT '[]'::jsonb,
    dates JSONB DEFAULT '[]'::jsonb,
    user_notes JSONB DEFAULT '[]'::jsonb,
    review_status TEXT DEFAULT 'needs-review',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for high-performance retrieval and foreign key integrity
CREATE INDEX IF NOT EXISTS idx_evidence_records_user_id ON public.evidence_records(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_records_created_at ON public.evidence_records(created_at DESC);

-- 2. Enable Row-Level Security (RLS) on evidence_records
ALTER TABLE public.evidence_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running script to ensure clean setup
DROP POLICY IF EXISTS "Users can view only their own evidence records" ON public.evidence_records;
DROP POLICY IF EXISTS "Users can insert their own evidence records" ON public.evidence_records;
DROP POLICY IF EXISTS "Users can update their own evidence records" ON public.evidence_records;
DROP POLICY IF EXISTS "Users can delete their own evidence records" ON public.evidence_records;

-- Policy 1: Users can only query/view their own evidence
CREATE POLICY "Users can view only their own evidence records"
    ON public.evidence_records
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy 2: Users can only insert records belonging to their authenticated ID
CREATE POLICY "Users can insert their own evidence records"
    ON public.evidence_records
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can only update their own records
CREATE POLICY "Users can update their own evidence records"
    ON public.evidence_records
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can only delete their own records
CREATE POLICY "Users can delete their own evidence records"
    ON public.evidence_records
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 3. Configure Private Storage Bucket for Evidence Vault
-- Bucket is marked private (public = false) with 50MB file size limits
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'evidence-vault',
    'evidence-vault',
    false,
    52428800, -- 50 MB limit
    ARRAY[
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
        'image/heic',
        'application/pdf',
        'text/plain',
        'text/markdown',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'video/mp4',
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/m4a'
    ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 52428800,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. Enable RLS and Storage Policies on storage.objects
-- Policies ensure each user can only read, upload, modify, and delete files inside their own user folder:
-- storage path format: {auth.uid()}/{timestamp}-{filename}

DROP POLICY IF EXISTS "Authenticated users can read their own evidence files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to their own folder in evidence-vault" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own evidence files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own evidence files" ON storage.objects;

-- Storage SELECT: Only owner can download or access private signed URLs
CREATE POLICY "Authenticated users can read their own evidence files"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'evidence-vault'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage INSERT: Authenticated users can only upload into their own folder {user_id}/...
CREATE POLICY "Authenticated users can upload to their own folder in evidence-vault"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'evidence-vault'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage UPDATE: Authenticated users can only update files in their own folder
CREATE POLICY "Authenticated users can update their own evidence files"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'evidence-vault'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage DELETE: Authenticated users can only delete files in their own folder
CREATE POLICY "Authenticated users can delete their own evidence files"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'evidence-vault'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
