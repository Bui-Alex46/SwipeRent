export interface UserProfile {
  id: number;
  user_id: number;
  full_name: string;
  phone_number: string;
  date_of_birth: string;
  current_address: string;
  bio: string;
  occupation: string;
  monthly_income: number;
  preferred_locations: string[];
  max_budget: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  full_name: string;
  phone_number: string;
  date_of_birth: string;
  current_address: string;
  bio: string;
  occupation: string;
  monthly_income: number;
  preferred_locations: string[];
  max_budget: number;
} 