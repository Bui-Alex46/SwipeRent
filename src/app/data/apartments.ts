import type { Apartment } from "@/app/types/apartment"
import cacheData from "./cacheData.json"

// Define the type for the API response data
interface ApiApartmentResult {
  property_id?: string;
  listing_id?: string;
  advertisers?: Array<{
    office?: {
      name?: string;
    };
  }>;
  list_price_min?: number;
  list_price_max?: number;
  location?: {
    address?: {
      line?: string;
      city?: string;
      state_code?: string;
    };
  };
  description?: {
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
  beds?: number;
  baths?: number;
  size?: number;
  primary_photo?: {
    href: string;
  };
  photos?: Array<{ href: string }>;
  details?: Array<{ 
    category: string;
    text: string[]; 
  }>;
  pet_policy?: unknown;
}

export const apartments: Apartment[] = (cacheData.data.results as unknown as ApiApartmentResult[]).map((result) => ({
  id: result.property_id || result.listing_id,
  property_id: result.property_id,
  title: result.advertisers?.[1]?.office?.name || "Apartment",
  price: result.list_price_min || result.list_price_max || 2000,
  location: {
    address: {
      line: result.location?.address?.line || "Address Available Upon Request",
      city: result.location?.address?.city || "",
      state_code: result.location?.address?.state_code || ""
    }
  },
  description: {
    beds_min: result.description?.beds_min,
    beds_max: result.description?.beds_max,
    beds: result.description?.beds,
    baths_min: result.description?.baths_min,
    baths_max: result.description?.baths_max,
    baths: result.description?.baths,
    baths_full_calc: result.description?.baths_full_calc,
    sqft_min: result.description?.sqft_min,
    sqft_max: result.description?.sqft_max,
    sqft: result.description?.sqft
  },
  beds: result.beds,
  baths: result.baths,
  size: result.size,
  primary_photo: result.primary_photo,
  photos: result.photos,
  details: result.details?.map(detail => ({
    category: detail.category || 'General',
    text: detail.text
  })),
  pet_policy: result.pet_policy,
  advertisers: result.advertisers
}));

// Debug log
console.log('Transformed apartments:', apartments.map(apt => ({
  id: apt.id,
  imageUrl: apt.primary_photo?.href,
  photoCount: apt.photos?.length
})));