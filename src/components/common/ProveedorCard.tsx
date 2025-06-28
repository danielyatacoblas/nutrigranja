
import React from 'react';
import StarRating from './StarRating';
import ProgressBar from './ProgressBar';
import { 
  Sprout, 
  Building,
  Briefcase, 
  Truck, 
  Factory, 
  Store,
  ShoppingBag, // Replacing Shop with ShoppingBag
  Handshake,
  CreditCard
} from 'lucide-react';

interface ProveedorCardProps {
  logo: string;
  nombre: string;
  rating: number;
  porcentajePedidos: number;
  loading?: boolean;
}

const ProveedorCard: React.FC<ProveedorCardProps> = ({
  logo,
  nombre,
  rating,
  porcentajePedidos,
  loading = false
}) => {
  // Get icon component based on icon name from provider type
  const getIconComponent = () => {
    // Check if logo is a valid icon name
    if (typeof logo === 'string') {
      // Map icon names to Lucide components
      const iconMap: Record<string, React.ReactNode> = {
        'building': <Building className="w-full h-full text-nutri-green" />,
        'briefcase': <Briefcase className="w-full h-full text-nutri-green" />,
        'truck': <Truck className="w-full h-full text-nutri-green" />,
        'factory': <Factory className="w-full h-full text-nutri-green" />,
        'store': <Store className="w-full h-full text-nutri-green" />,
        'shopping-bag': <ShoppingBag className="w-full h-full text-nutri-green" />, // Updated key and component
        'handshake': <Handshake className="w-full h-full text-nutri-green" />,
        'credit-card': <CreditCard className="w-full h-full text-nutri-green" />,
        'sprout': <Sprout className="w-full h-full text-nutri-green" />
      };

      const iconName = logo.toLowerCase().trim();
      
      // Return the corresponding icon component if it exists
      if (iconMap[iconName]) {
        return iconMap[iconName];
      }
      
      // If it's a URL, display as image
      if (logo.startsWith('http')) {
        return (
          <img 
            src={logo} 
            alt={`Icono de ${nombre}`} 
            className="w-full h-full object-contain"
            onError={(e) => {
              // If the image fails, show the default icon
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
              const iconElement = document.createElement('div');
              iconElement.className = 'flex items-center justify-center w-full h-full';
              iconElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-nutri-green"><path d="M7 20h10"></path><path d="M10 20c5.5-2.5.8-6.4 3-10"></path><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"></path><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"></path></svg>';
              e.currentTarget.parentElement?.appendChild(iconElement);
            }}
          />
        );
      }
    }
    
    // Default icon if no match is found
    return <Sprout className="w-full h-full text-nutri-green" />;
  };

  // If the component is used only for showing an icon (name empty)
  if (!nombre && !rating && !porcentajePedidos) {
    return <div className="flex items-center justify-center h-full">{getIconComponent()}</div>;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center animate-pulse">
        <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="w-full h-2 bg-gray-200 rounded mt-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mt-2 self-end"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center">
      <div className="w-24 h-24 mb-4 flex items-center justify-center">
        {getIconComponent()}
      </div>
      <h3 className="text-lg font-medium mb-2 text-center line-clamp-2">{nombre}</h3>
      <div className="flex mb-2">
        <StarRating rating={rating} />
        <span className="ml-2 text-gray-700">{rating.toFixed(1)}</span>
      </div>
      <div className="w-full mt-2">
        <ProgressBar value={porcentajePedidos} />
        <p className="text-sm text-gray-600 mt-1">{porcentajePedidos}% de pedidos</p>
      </div>
    </div>
  );
};

export default ProveedorCard;
