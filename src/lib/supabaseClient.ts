import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default demo environment variables or fallback values
const DEFAULT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const DEFAULT_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

class SupabaseManager {
  private static instance: SupabaseClient | null = null;

  public static getClient(): SupabaseClient | null {
    if (this.instance) return this.instance;

    const url = localStorage.getItem('syncura_supabase_url') || DEFAULT_SUPABASE_URL;
    const key = localStorage.getItem('syncura_supabase_key') || DEFAULT_SUPABASE_ANON_KEY;

    if (url && key) {
      try {
        this.instance = createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        });
        return this.instance;
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
        return null;
      }
    }
    return null;
  }

  public static setCredentials(url: string, key: string): boolean {
    try {
      localStorage.setItem('syncura_supabase_url', url.trim());
      localStorage.setItem('syncura_supabase_key', key.trim());
      this.instance = createClient(url.trim(), key.trim());
      return true;
    } catch (err) {
      console.error('Error creating Supabase client with provided credentials:', err);
      return false;
    }
  }

  public static clearCredentials() {
    localStorage.removeItem('syncura_supabase_url');
    localStorage.removeItem('syncura_supabase_key');
    this.instance = null;
  }
}

export const getSupabaseClient = () => SupabaseManager.getClient();
export const setSupabaseCredentials = (url: string, key: string) => SupabaseManager.setCredentials(url, key);
export const clearSupabaseCredentials = () => SupabaseManager.clearCredentials();
