import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

export type Page = 'inicio' | 'comunicados' | 'eventos' | 'galeria' | 'documentos' | 'faq' | 'acesso-restrito' | 'login';

export type AdminTab = 'comunicados' | 'eventos' | 'documentos' | 'galeria' | 'faq';

export interface Comunicado {
  id: number;
  title: string;
  summary: string;
  created_at: string;
  author_id: string;
  profiles: {
    full_name: string;
  } | null;
}

export interface Evento {
  id: number;
  title: string;
  event_date: string;
  description: string;
  location: string;
  created_at: string;
  created_by?: string;
}

export interface Documento {
  id: number;
  name: string;
  uploaded_at: string;
  file_size_kb: number | null;
  file_path: string;
  uploaded_by: string;
  url?: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  created_at: string;
}

export interface GaleriaItem {
  id: number;
  alt_text: string;
  image_path: string;
  uploaded_at: string;
  uploaded_by: string;
  url?: string;
}

export type User = SupabaseUser;
export type Session = SupabaseSession;

export interface Profile {
  id: string;
  full_name: string;
  whatsapp: string;
  role: 'sindico' | 'morador';
}