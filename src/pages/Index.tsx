
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir a la landing page
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-nutri-cream">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-nutri-green">Nutri</span>
          <span className="text-nutri-yellow">Granja</span>
        </h1>
        <p className="text-xl text-gray-600">Cargando...</p>
      </div>
    </div>
  );
};

export default Index;
