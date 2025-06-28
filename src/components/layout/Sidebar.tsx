
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  TruckIcon, 
  Package, 
  ShoppingCart, 
  BarChart2, 
  Users,
  Award,
  Clock,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Bot
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userProfile, signOut, loading } = useAuth();
  
  // Definimos los items del sidebar y filtramos según el rol
  const allSidebarItems = [
    { icon: Home, label: 'Inicio', path: '/dashboard', roles: ['admin', 'usuario'] },
    { icon: Award, label: 'Ranking', path: '/dashboard/ranking', roles: ['admin', 'usuario'] },
    { icon: ShoppingCart, label: 'Compra', path: '/dashboard/compra', roles: ['admin', 'usuario'] },
    { icon: TruckIcon, label: 'Proveedores', path: '/dashboard/proveedores', roles: ['admin', 'usuario'] },
    { icon: Package, label: 'Productos', path: '/dashboard/productos', roles: ['admin', 'usuario'] },
    { icon: BarChart2, label: 'Pedidos', path: '/dashboard/pedidos', roles: ['admin', 'usuario'] },
    { icon: Users, label: 'Usuarios', path: '/dashboard/usuarios', roles: ['admin'] },
    { icon: Clock, label: 'Historial', path: '/dashboard/historial', roles: ['admin'] },
    { icon: Bot, label: 'Asistente', path: '/dashboard/asistente', roles: ['admin'] },
  ];

  // Filtramos los items según el rol del usuario
  const sidebarItems = allSidebarItems.filter(item => {
    if (loading || !userProfile) {
      // Si está cargando o no hay perfil, mostrar solo elementos básicos
      return item.roles.includes('usuario');
    }
    return item.roles.includes(userProfile.rol);
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = () => {
    signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-md bg-nutri-green text-white"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar backdrop for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:sticky top-0 left-0 h-full bg-nutri-green transition-all duration-300 ease-in-out z-40
        flex flex-col
      `}>
        <div className="p-4 border-b border-nutri-lightgreen flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="text-nutri-yellow text-2xl">
              <span className="grid grid-cols-2 gap-0.5">
                <span className="block w-2 h-2 bg-nutri-yellow rounded-sm"></span>
                <span className="block w-2 h-2 bg-nutri-yellow rounded-sm"></span>
                <span className="block w-2 h-2 bg-nutri-yellow rounded-sm"></span>
                <span className="block w-2 h-2 bg-nutri-yellow rounded-sm"></span>
              </span>
            </div>
            {!isCollapsed && (
              <h1 className="text-white text-xl font-bold">
                <span className="text-white">Nutri</span>
                <span className="text-nutri-yellow">Granja</span>
              </h1>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:text-nutri-yellow hidden lg:block"
          >
            <ChevronLeft className={`transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex flex-col py-4 flex-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`
                flex items-center gap-2 px-4 py-3 text-white hover:bg-nutri-lightgreen/20
                ${location.pathname === item.path ? 'bg-nutri-lightgreen/30' : ''}
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        {/* Botón de cerrar sesión al final del sidebar */}
        <div className="mt-auto border-t border-nutri-lightgreen p-4">
          <button 
            onClick={handleSignOut}
            className={`
              flex items-center gap-2 px-4 py-3 w-full text-white hover:bg-nutri-lightgreen/20 rounded-md
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
