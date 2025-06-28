
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import MainLayout from './components/layout/MainLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import RecoverPassword from './pages/auth/RecoverPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Proveedores from './pages/Proveedores';
import Productos from './pages/Productos';
import Compra from './pages/Compra';
import Usuarios from './pages/Usuarios';
import Historial from './pages/Historial';
import Reportes from './pages/Reportes';
import Pedidos from './pages/Pedidos';
import Ranking from './pages/Ranking';
import Asistente from './pages/Asistente';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/recuperar-contrasena" element={<RecoverPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/dashboard" element={<MainLayout />}>
                <Route index element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="proveedores" element={
                  <ProtectedRoute>
                    <Proveedores />
                  </ProtectedRoute>
                } />
                <Route path="productos" element={
                  <ProtectedRoute>
                    <Productos />
                  </ProtectedRoute>
                } />
                <Route path="compra" element={
                  <ProtectedRoute>
                    <Compra />
                  </ProtectedRoute>
                } />
                <Route path="pedidos" element={
                  <ProtectedRoute>
                    <Pedidos />
                  </ProtectedRoute>
                } />
                <Route path="ranking" element={
                  <ProtectedRoute>
                    <Ranking />
                  </ProtectedRoute>
                } />
                <Route path="reportes" element={
                  <ProtectedRoute>
                    <Reportes />
                  </ProtectedRoute>
                } />
                
                {/* Rutas protegidas para admin */}
                <Route path="usuarios" element={
                  <AdminRoute>
                    <Usuarios />
                  </AdminRoute>
                } />
                <Route path="historial" element={
                  <AdminRoute>
                    <Historial />
                  </AdminRoute>
                } />
                <Route path="asistente" element={
                  <AdminRoute>
                    <Asistente />
                  </AdminRoute>
                } />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            <Toaster position="bottom-right" richColors />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
