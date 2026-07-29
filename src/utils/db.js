// filepath: src/utils/db.js
export function getDbCredentials(runtime) {
  const dbUrl = runtime?.env?.SUPABASE_URL || import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || 'https://your-supabase-project.supabase.co';
  
  // Strict separation: write operations require the private service role key.
  // Never fall back to PUBLIC_ prefixed keys.
  const dbWriteKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Read operations use the anonymous key.
  const dbReadKey = runtime?.env?.SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

  return { dbUrl, dbWriteKey, dbReadKey };
}

export function getStorageBucket(runtime) {
  return runtime?.env?.SUPABASE_STORAGE_BUCKET || import.meta.env.SUPABASE_STORAGE_BUCKET || 'resources';
}
