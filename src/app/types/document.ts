export interface Document {
  id: number;
  user_id: number;
  document_type: string;
  file_path: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
} 