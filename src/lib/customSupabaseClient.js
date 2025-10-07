import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynjlagkhdzjyxulfxizg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluamxhZ2toZHpqeXh1bGZ4aXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDcxOTUsImV4cCI6MjA3MjgyMzE5NX0.nV00Ov_YtgEplHg097XD08d7rXqoOIUhDgIruynhDRM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);