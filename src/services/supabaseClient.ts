import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Configuration helper
const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawSupabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

/**
 * Normalizes Supabase URL in case the user specified /rest/v1/ suffix
 */
export function normalizeSupabaseUrl(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  }
}

export const SUPABASE_URL = normalizeSupabaseUrl(rawSupabaseUrl);
export const SUPABASE_KEY = rawSupabaseKey;
export const EVIDENCE_STORAGE_BUCKET = 'evidence-vault';

// File constraints
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const ALLOWED_MIME_PREFIXES = [
  'image/',
  'application/pdf',
  'text/',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/',
  'audio/'
];

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_URL.startsWith('http') &&
    SUPABASE_KEY &&
    SUPABASE_KEY.length > 10
  );
}

export function getSupabaseConfigError(): string | null {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return 'Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment (.env file).';
  }
  if (!SUPABASE_URL.startsWith('http')) {
    return 'Invalid VITE_SUPABASE_URL. It must start with https://';
  }
  return null;
}

// Client singleton
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

/**
 * Validates file size and permitted types
 */
export function validateEvidenceFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds the maximum allowed size of 50MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`
    };
  }

  const fileType = file.type || '';
  const fileName = file.name.toLowerCase();

  const isAllowedType =
    ALLOWED_MIME_PREFIXES.some(prefix => fileType.startsWith(prefix)) ||
    fileName.endsWith('.pdf') ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.docx') ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.webp') ||
    fileName.endsWith('.mp3') ||
    fileName.endsWith('.wav') ||
    fileName.endsWith('.m4a') ||
    fileName.endsWith('.mp4');

  if (!isAllowedType) {
    return {
      valid: false,
      error: `File "${file.name}" has an unsupported format. Supported formats: Images (PNG, JPG, WEBP), PDFs, Text documents, Audio, and Video files.`
    };
  }

  return { valid: true };
}

/**
 * Authentication service helpers
 */
export const SupabaseAuth = {
  async getSession(): Promise<Session | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (err) {
      console.warn('Error fetching Supabase session:', err);
      return null;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        // Fall back to getSession if getUser returns error
        const session = await this.getSession();
        return session?.user || null;
      }
      return data.user;
    } catch {
      return null;
    }
  },

  async signUp(email: string, password: string): Promise<{ user: User | null; session: Session | null; error?: string }> {
    if (!supabase) {
      return { user: null, session: null, error: getSupabaseConfigError() || 'Supabase is not configured' };
    }
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { user: null, session: null, error: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      return { user: null, session: null, error: 'Password must be at least 6 characters long.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    return { user: data.user, session: data.session };
  },

  async signIn(email: string, password: string): Promise<{ user: User | null; session: Session | null; error?: string }> {
    if (!supabase) {
      return { user: null, session: null, error: getSupabaseConfigError() || 'Supabase is not configured' };
    }
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { user: null, session: null, error: 'Please enter a valid email address.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    return { user: data.user, session: data.session };
  },

  async signOut(): Promise<{ error?: string }> {
    if (!supabase) return {};
    const { error } = await supabase.auth.signOut();
    if (error) return { error: error.message };
    return {};
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (!supabase) return { unsubscribe: () => {} };
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  }
};

/**
 * Evidence Storage and Metadata persistence
 */
export interface PersistedEvidenceRecord {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  file_size_bytes: number;
  mime_type: string;
  evidence_type: string;
  sha256_hash?: string;
  extracted_text?: string;
  ocr_confidence?: number;
  entities?: any[];
  dates?: any[];
  user_notes?: string[];
  review_status: string;
  signed_url?: string;
  created_at: string;
  updated_at?: string;
}

export const SupabaseEvidenceVault = {
  /**
   * Upload file to private storage bucket under the user's directory
   * storage path format: {userId}/{timestamp}-{filename}
   */
  async uploadFile(
    file: File,
    userId: string,
    onProgress?: (percent: number) => void
  ): Promise<{ filePath: string; signedUrl?: string; error?: string }> {
    if (!supabase) {
      return { filePath: '', error: getSupabaseConfigError() || 'Supabase is not configured' };
    }

    // Client-side file validation
    const validation = validateEvidenceFile(file);
    if (!validation.valid) {
      return { filePath: '', error: validation.error };
    }

    try {
      if (onProgress) onProgress(25);

      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${userId}/${timestamp}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from(EVIDENCE_STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'application/octet-stream'
        });

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        return { filePath: '', error: `Storage upload failed: ${uploadError.message}` };
      }

      if (onProgress) onProgress(75);

      // Generate secure signed URL for private access (expires in 1 hour)
      const { data: signedData, error: signedError } = await supabase.storage
        .from(EVIDENCE_STORAGE_BUCKET)
        .createSignedUrl(filePath, 3600);

      if (onProgress) onProgress(100);

      return {
        filePath,
        signedUrl: signedData?.signedUrl
      };
    } catch (err: any) {
      console.error('Storage exception:', err);
      return { filePath: '', error: err?.message || 'Storage upload failed' };
    }
  },

  /**
   * Create or refresh signed URL for private document access
   */
  async createSignedUrl(filePath: string, expiresInSeconds: number = 3600): Promise<string | null> {
    if (!supabase || !filePath) return null;
    try {
      const { data, error } = await supabase.storage
        .from(EVIDENCE_STORAGE_BUCKET)
        .createSignedUrl(filePath, expiresInSeconds);
      if (error) {
        console.warn('Failed to generate signed URL:', error);
        return null;
      }
      return data?.signedUrl || null;
    } catch {
      return null;
    }
  },

  /**
   * Insert metadata into evidence_records table
   */
  async saveEvidenceRecord(
    record: Omit<PersistedEvidenceRecord, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: PersistedEvidenceRecord | null; error?: string }> {
    if (!supabase) {
      return { data: null, error: getSupabaseConfigError() || 'Supabase is not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('evidence_records')
        .insert({
          user_id: record.user_id,
          filename: record.filename,
          file_path: record.file_path,
          file_size_bytes: record.file_size_bytes,
          mime_type: record.mime_type,
          evidence_type: record.evidence_type,
          sha256_hash: record.sha256_hash,
          extracted_text: record.extracted_text,
          ocr_confidence: record.ocr_confidence,
          entities: record.entities || [],
          dates: record.dates || [],
          user_notes: record.user_notes || [],
          review_status: record.review_status || 'needs-review'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase saveEvidenceRecord error:', error);
        return { data: null, error: `Database insert failed: ${error.message}` };
      }

      return { data: data as PersistedEvidenceRecord };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Database error' };
    }
  },

  /**
   * Fetch all evidence records for the authenticated user
   */
  async fetchUserEvidenceRecords(userId: string): Promise<PersistedEvidenceRecord[]> {
    if (!supabase || !userId) return [];
    try {
      const { data, error } = await supabase
        .from('evidence_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetchUserEvidenceRecords error:', error);
        return [];
      }

      // Generate signed URLs for items with file_path
      const records = (data || []) as PersistedEvidenceRecord[];
      const withSignedUrls = await Promise.all(
        records.map(async (rec) => {
          if (rec.file_path) {
            const signed = await this.createSignedUrl(rec.file_path);
            return { ...rec, signed_url: signed || undefined };
          }
          return rec;
        })
      );

      return withSignedUrls;
    } catch (err) {
      console.warn('Error fetching user evidence records:', err);
      return [];
    }
  },

  /**
   * Update evidence record metadata (e.g. notes, reviewStatus, type)
   */
  async updateEvidenceRecord(
    id: string,
    userId: string,
    updates: Partial<Pick<PersistedEvidenceRecord, 'user_notes' | 'review_status' | 'evidence_type' | 'extracted_text'>>
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: false, error: 'Supabase is not configured' };
    try {
      const { error } = await supabase
        .from('evidence_records')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Update failed' };
    }
  },

  /**
   * Delete evidence record and its corresponding storage object
   */
  async deleteEvidenceRecord(
    id: string,
    filePath: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: false, error: 'Supabase is not configured' };
    try {
      // 1. Delete storage file if present
      if (filePath) {
        await supabase.storage
          .from(EVIDENCE_STORAGE_BUCKET)
          .remove([filePath]);
      }

      // 2. Delete database row
      const { error: dbError } = await supabase
        .from('evidence_records')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (dbError) return { success: false, error: dbError.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Delete failed' };
    }
  }
};
