
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  editable?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 20,
  editable = false,
  onChange
}) => {
  return (
    <div className="flex">
      {Array.from({ length: maxRating }).map((_, index) => (
        <div 
          key={index}
          onClick={() => editable && onChange && onChange(index + 1)}
          className={editable ? 'cursor-pointer' : ''}
        >
          <Star
            size={size}
            className={`${
              index < rating 
                ? 'text-nutri-yellow fill-nutri-yellow' 
                : 'text-nutri-yellow stroke-nutri-yellow'
            }`}
          />
        </div>
      ))}
    </div>
  );
};

export default StarRating;
