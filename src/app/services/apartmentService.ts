import { Apartment } from '../types/apartment';

export interface FilterParams {
  location?: string;
  prices?: { min?: number; max?: number };
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string[];
  pets?: ('cats' | 'dogs' | 'no_pets_allowed')[];
}

export async function fetchApartments(filters: FilterParams): Promise<Apartment[]> {
  try {
    const queryString = new URLSearchParams();
    
    // Always include a location, either from filters or default
    const location = filters.location || 'Brea, CA';
    queryString.append('location', `city:${location}`);
    
    if (filters.prices?.min) queryString.append('prices', `${filters.prices.min},${filters.prices.max || ''}`);
    if (filters.bedrooms) queryString.append('bedrooms', filters.bedrooms.toString());
    if (filters.bathrooms) queryString.append('bathrooms', filters.bathrooms.toString());
    if (filters.propertyType?.length) queryString.append('propertyType', filters.propertyType.join(','));
    if (filters.pets?.length) queryString.append('pets', filters.pets.join(','));

    const url = `http://localhost:3001/api/listings?${queryString}`;
    console.log('Fetching from URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.error('Network error:', error);
      throw new Error('Network error - Is the backend server running?');
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error('API Response:', data);
      if (data.errors && data.errors.length > 0) {
        const errorDetails = data.errors[0];
        throw new Error(`API Error: ${errorDetails.message} (Code: ${errorDetails.code})`);
      }
      throw new Error(data.message || data.error || 'Failed to fetch apartments');
    }

    if (!data.data?.results) {
      console.warn('No results found in response:', data);
      return [];
    }

    return data.data.results;
  } catch (error) {
    console.error('Fetch error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch apartments: ${error.message}`);
    }
    throw error;
  }
} 