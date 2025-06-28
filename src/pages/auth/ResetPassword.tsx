
import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { toast } from 'sonner';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error('Por favor complete todos los campos');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    // Simulate API call
    toast.success('Contraseña actualizada correctamente');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80')" }}>
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-6">
          <div className="mr-2 text-nutri-yellow text-2xl">
            <span className="grid grid-cols-2 gap-0.5">
              <span className="block w-2 h-2 bg-nutri-yellow rounded-sm"></span>
              <span className="block w-2 h-2 bg-nutri-yellow rounded-sm"></span>
              <span className="block w-2 h-2 bg-nutri-yellow rounded-sm"></span>
              <span className="block w-2 h-2 bg-nutri-yellow rounded-sm"></span>
            </span>
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-nutri-green">Nutri</span>
            <span className="text-nutri-yellow">Granja</span>
          </h1>
        </div>
        <p className="text-center text-gray-600 mb-2">Sistema de Gestión Agrícola</p>
        
        <div className="mb-8">
          <Link to="/" className="flex items-center text-nutri-green hover:underline">
            <ArrowLeft size={16} className="mr-1" /> Volver al inicio de sesión
          </Link>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
          Recuperar Contraseña
        </h2>
        
        <p className="text-gray-600 mb-6">
          Ingresa tu nueva contraseña y confírmala
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nueva Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <LockKeyhole size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
                placeholder="Ingrese su nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <LockKeyhole size={18} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
                placeholder="Confirme su nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            Confirmar cambios
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
