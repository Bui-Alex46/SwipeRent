export interface Apartment {
  id?: string;
  property_id?: string;
  title?: string;
  price?: number;
  beds?: number;
  baths?: number;
  size?: number;
  amenities?: string[];
  location: {
    address: {
      line: string;
      city: string;
      state_code: string;
    };
  };
  list_price_min?: number;
  description: {
    beds_min?: number;
    beds_max?: number;
    beds?: number;
    baths_min?: number;
    baths_max?: number;
    baths?: number;
    baths_full_calc?: number;
    sqft_min?: number;
    sqft_max?: number;
    sqft?: number;
  };
  primary_photo?: { href: string };
  imageUrl?: string;
  photos?: Array<{ href: string }>;
  details?: Array<{
    category: string;
    text: string[];
  }>;
}
  
  