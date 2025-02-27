import { Apartment } from "../types/apartment"
import { Bed, Bath, Maximize, PawPrint, DollarSign, Check, X } from "lucide-react"

interface ApartmentInfoProps {
  apartment: {
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
      baths_min?: number;
      sqft_min?: number;
    };
    details?: Array<{
      category: string;
      text: string[];
    }>;
  };
}

export function ApartmentInfo({ apartment }: ApartmentInfoProps) {
  return (
    <div className="text-white space-y-4">
      <div>
        <h2 className="text-2xl font-bold">
          {apartment?.location?.address?.line || 'Address not available'}
        </h2>
        <p className="text-white/80">
          {apartment?.location?.address?.city}, {apartment?.location?.address?.state_code}
        </p>
      </div>
      
      <div>
        <p className="text-3xl font-bold">
          ${apartment?.list_price_min?.toLocaleString() || 'Price not available'}
        </p>
      </div>

      <div>
        <p className="text-lg">
          {apartment?.description?.beds_min || '?'} bed • {apartment?.description?.baths_min || '?'} bath • {apartment?.description?.sqft_min?.toLocaleString() || '?'} sqft
        </p>
      </div>

      {apartment?.details?.map((detail, index) => (
        <div key={index}>
          <h3 className="font-semibold">{detail.category}</h3>
          <ul className="list-disc list-inside text-white/80">
            {detail.text.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
} 