import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!supabaseUrl.startsWith('http')) {
  supabaseUrl = 'https://placeholder.url.supabase.co';
}

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Thiếu thông tin cấu hình Supabase (VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY). Vui lòng thêm vào file .env!');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
