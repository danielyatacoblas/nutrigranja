
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading, userProfile } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuthorization = () => {
      console.log('AdminRoute - Checking authorization:', { 
        user: !!user, 
        userProfile: userProfile?.rol, 
        loading 
      });
      
      if (loading) {
        console.log('AdminRoute - Auth still loading...');
        return;
      }

      if (!user) {
        console.log('AdminRoute - No user, redirecting to login');
        setIsAuthorized(false);
        return;
      }

      if (!userProfile) {
        console.log('AdminRoute - No user profile, waiting...');
        // Esperar un poco más por el perfil
        const timeout = setTimeout(() => {
          console.log('AdminRoute - Profile timeout, denying access');
          setIsAuthorized(false);
        }, 3000);
        return () => clearTimeout(timeout);
      }

      // Verificar rol de administrador
      const hasAdminRole = userProfile.rol === 'admin';
      console.log('AdminRoute - Role check result:', hasAdminRole);
      
      if (!hasAdminRole) {
        toast.error('No tienes permisos para acceder a esta página');
      }
      
      setIsAuthorized(hasAdminRole);
    };

    checkAuthorization();
  }, [user, userProfile, loading]);

  // Mostrar loading mientras se verifica la autorización
  if (loading || isAuthorized === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirigir si no está autenticado
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirigir si no es administrador
  if (!isAuthorized) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
};

export default AdminRoute;
