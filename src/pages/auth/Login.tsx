
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, LockKeyhole } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor ingrese email y contraseña');
      return;
    }
    
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled in the signIn function
      console.error('Error al iniciar sesión:', error);
    }
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
        <p className="text-center text-gray-600 mb-6">Sistema de Gestión Agrícola</p>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <LockKeyhole size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
                placeholder="Ingrese su contraseña"
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
          
          <Button type="submit" className="w-full mb-4" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>
        
        <div className="text-center mt-4">
          <Link to="/recuperar-contrasena" className="text-nutri-green hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
