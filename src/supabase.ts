import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';

// ====================================
// SUPABASE CLIENT INITIALIZATION
// ====================================

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Access auth directly from supabase
export const auth = supabase.auth;

// ====================================
// OPERATION TYPE ENUM (Same as Firebase)
// ====================================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// ====================================
// ERROR INTERFACE & HANDLER (Supabase Version)
// ====================================

export interface SupabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

/**
 * Handle Supabase errors with detailed logging
 * Same interface as Firebase for easy migration
 */
export async function handleSupabaseError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errMsg = error instanceof Error ? error.message : String(error);

  // Get current user session
  const {
    data: { session },
  } = await auth.getSession();
  const user = session?.user;

  const errInfo: SupabaseErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: user?.id || null,
      email: user?.email || null,
      emailVerified: user?.email_confirmed || null,
      isAnonymous: user?.is_anonymous || null,
    },
    operationType,
    path,
  };

  console.error('Supabase Error Event Captured: ', JSON.stringify(errInfo));

  // Don't throw on transient offline errors
  const isTransientOffline =
    errMsg.toLowerCase().includes('unavailable') ||
    errMsg.toLowerCase().includes('could not reach') ||
    errMsg.toLowerCase().includes('offline') ||
    errMsg.toLowerCase().includes('network');

  if (!isTransientOffline) {
    throw new Error(JSON.stringify(errInfo));
  }
}

// ====================================
// AUTHENTICATION HELPERS
// ====================================

/**
 * Get current user
 */
export async function getCurrentUser() {
  const {
    data: { session },
  } = await auth.getSession();
  return session?.user || null;
}

/**
 * Subscribe to auth state changes (replacement for Firebase's onAuthStateChanged)
 * Usage:
 *   const unsubscribe = onAuthStateChanged((user) => {
 *     console.log('User:', user);
 *   });
 *   return unsubscribe;
 */
export function onAuthStateChanged(
  callback: (user: any | null) => void
): () => void {
  const { data } = auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });

  // Return unsubscribe function
  return () => {
    data?.subscription?.unsubscribe();
  };
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  const { data, error } = await auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await auth.signOut();
  if (error) throw error;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Create account with email and password
 */
export async function createUserWithEmail(email: string, password: string) {
  const { data, error } = await auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// ====================================
// DATABASE OPERATIONS (Helpers)
// ====================================

/**
 * Save/Update document (replaces Firebase setDoc)
 * Usage:
 *   await upsertDoc('skills', { id: 'react', name: 'React', level: 90 });
 */
export async function upsertDoc(
  table: string,
  data: any
) {
  const { data: result, error } = await supabase
    .from(table)
    .upsert(data, { onConflict: 'id' })
    .select();

  if (error) {
    await handleSupabaseError(error, OperationType.WRITE, table);
  }

  return result;
}

/**
 * Delete document (replaces Firebase deleteDoc)
 * Usage:
 *   await deleteDoc('skills', 'react');
 */
export async function deleteDoc(
  table: string,
  id: string
) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) {
    await handleSupabaseError(error, OperationType.DELETE, `${table}/${id}`);
  }
}

/**
 * Get single document (replaces Firebase getDoc)
 * Usage:
 *   const skill = await getDoc('skills', 'react');
 */
export async function getDoc(
  table: string,
  id: string
) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    await handleSupabaseError(error, OperationType.GET, `${table}/${id}`);
  }

  return data;
}

/**
 * Get all documents (replaces Firebase getDocs)
 * Usage:
 *   const allSkills = await getAllDocs('skills');
 */
export async function getAllDocs(
  table: string
) {
  const { data, error } = await supabase
    .from(table)
    .select('*');

  if (error) {
    await handleSupabaseError(error, OperationType.LIST, table);
  }

  return data || [];
}

/**
 * Query with filters (replaces Firebase where())
 * Usage:
 *   const results = await queryDocs('skills', { category: 'Offensive' });
 */
export async function queryDocs(
  table: string,
  filters: Record<string, any>
) {
  let query = supabase.from(table).select('*');

  // Apply filters
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }

  const { data, error } = await query;

  if (error) {
    await handleSupabaseError(error, OperationType.LIST, `${table}:query`);
  }

  return data || [];
}

/**
 * Batch operations (replaces Firebase writeBatch)
 * Usage:
 *   const batch = new SupabaseBatch(supabase);
 *   batch.set('skills', {...});
 *   batch.set('certs', {...});
 *   await batch.commit();
 */
export class SupabaseBatch {
  private operations: Array<{
    type: 'insert' | 'update' | 'delete';
    table: string;
    data: any;
  }> = [];

  constructor(private supabaseClient: SupabaseClient) {}

  /**
   * Add insert/update operation
   */
  set(table: string, data: any) {
    this.operations.push({
      type: 'insert',
      table,
      data,
    });
    return this;
  }

  /**
   * Add delete operation
   */
  delete(table: string, id: string) {
    this.operations.push({
      type: 'delete',
      table,
      data: { id },
    });
    return this;
  }

  /**
   * Execute all operations
   */
  async commit() {
    try {
      const results = [];

      for (const op of this.operations) {
        if (op.type === 'insert') {
          const { data, error } = await this.supabaseClient
            .from(op.table)
            .upsert(op.data, { onConflict: 'id' })
            .select();

          if (error) throw error;
          results.push(data);
        } else if (op.type === 'delete') {
          const { error } = await this.supabaseClient
            .from(op.table)
            .delete()
            .eq('id', op.data.id);

          if (error) throw error;
          results.push({ deleted: true });
        }
      }

      return results;
    } catch (err) {
      await handleSupabaseError(err, OperationType.WRITE, 'batch_operation');
      throw err;
    }
  }
}

// ====================================
// REALTIME SUBSCRIPTIONS
// ====================================

/**
 * Subscribe to real-time changes
 * Usage:
 *   const unsubscribe = subscribeToTable('skills', (payload) => {
 *     console.log('Changes:', payload);
 *   });
 */
export function subscribeToTable(
  table: string,
  callback: (payload: any) => void
): () => void {
  const subscription = supabase
    .from(table)
    .on('*', (payload) => {
      callback(payload);
    })
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

// ====================================
// STORAGE OPERATIONS (Optional - for file uploads)
// ====================================

/**
 * Upload file to Supabase Storage
 * Usage:
 *   await uploadFile('portfolio-images', 'my-image.png', file);
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) {
    await handleSupabaseError(error, OperationType.CREATE, `${bucket}/${path}`);
  }

  return data;
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
  bucket: string,
  path: string
) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    await handleSupabaseError(error, OperationType.DELETE, `${bucket}/${path}`);
  }
}

/**
 * Get public URL for file
 */
export function getPublicUrl(
  bucket: string,
  path: string
) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

// ====================================
// EXPORTS FOR EASY IMPORTING
// ====================================

export default {
  supabase,
  auth,
  OperationType,
  handleSupabaseError,
  getCurrentUser,
  onAuthStateChanged,
  signInWithGoogle,
  signOut,
  signInWithEmail,
  createUserWithEmail,
  upsertDoc,
  deleteDoc,
  getDoc,
  getAllDocs,
  queryDocs,
  SupabaseBatch,
  subscribeToTable,
  uploadFile,
  deleteFile,
  getPublicUrl,
};
