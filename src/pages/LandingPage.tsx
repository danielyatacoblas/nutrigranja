
import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Tractor, BarChart2, TruckIcon, Users, Clock, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';

const LandingPage = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-cover bg-center min-h-screen flex items-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80')" }}>
        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="bg-white/90 backdrop-blur-sm p-10 rounded-xl max-w-2xl shadow-lg">
            <div className="flex items-center mb-6">
              <div className="mr-3 text-nutri-yellow text-3xl">
                <span className="grid grid-cols-2 gap-0.5">
                  <span className="block w-3 h-3 bg-nutri-yellow rounded-sm"></span>
                  <span className="block w-3 h-3 bg-nutri-yellow rounded-sm"></span>
                  <span className="block w-3 h-3 bg-nutri-yellow rounded-sm"></span>
                  <span className="block w-3 h-3 bg-nutri-yellow rounded-sm"></span>
                </span>
              </div>
              <h1 className="text-4xl font-bold">
                <span className="text-nutri-green">Nutri</span>
                <span className="text-nutri-yellow">Granja</span>
              </h1>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Gestión Integral para Granjas
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Optimiza tus operaciones agrícolas con nuestra plataforma integral de gestión para granjas. Controla proveedores, productos, pedidos y más en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <Button size="lg">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="#caracteristicas">
                <Button variant="outline" size="lg">
                  Conocer Más
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Caracteristicas */}
      <div id="caracteristicas" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-nutri-green mb-4">Características Principales</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              NutriGranja ofrece todas las herramientas necesarias para optimizar la gestión de tu granja
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <TruckIcon className="w-10 h-10 text-nutri-green" />,
                title: "Gestión de Proveedores",
                description: "Administra tus proveedores, califica su servicio y mantén un ranking actualizado."
              },
              {
                icon: <Leaf className="w-10 h-10 text-nutri-green" />,
                title: "Gestión de Productos",
                description: "Cataloga tus productos, controla inventario y optimiza la producción."
              },
              {
                icon: <Tractor className="w-10 h-10 text-nutri-green" />,
                title: "Compras Eficientes",
                description: "Realiza pedidos, evalúa opciones y obtén las mejores condiciones."
              },
              {
                icon: <BarChart2 className="w-10 h-10 text-nutri-green" />,
                title: "Reportes Detallados",
                description: "Genera informes en PDF o Excel para análisis y toma de decisiones."
              },
              {
                icon: <Users className="w-10 h-10 text-nutri-green" />,
                title: "Gestión de Usuarios",
                description: "Administra usuarios con diferentes roles y permisos."
              },
              {
                icon: <Clock className="w-10 h-10 text-nutri-green" />,
                title: "Historial Completo",
                description: "Mantén un registro detallado de todas las operaciones realizadas."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Beneficios */}
      <div className="py-16 px-6 bg-nutri-cream/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-nutri-green mb-4">Beneficios de NutriGranja</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre cómo nuestra plataforma puede transformar la gestión de tu negocio agrícola
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              "Ahorra tiempo con procesos automatizados",
              "Reduce costos optimizando tus compras",
              "Mejora la calidad con evaluaciones de proveedores",
              "Toma decisiones basadas en datos reales",
              "Incrementa la productividad de tu equipo",
              "Mantén un control total de tu operación"
            ].map((benefit, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="min-w-6 h-6 text-nutri-green mr-3 mt-1" />
                <p className="text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/login">
              <Button size="lg">
                Comenzar Ahora
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Pie de pagina */}
      <footer className="bg-nutri-green text-white py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="mr-3 text-nutri-yellow text-2xl">
                <span className="grid grid-cols-2 gap-0.5">
                  <span className="block w-2 h-2 bg-nutri-yellow rounded-sm"></span>
                  <span className="block w-2 h-2 bg-nutri-yellow rounded-sm"></span>
                  <span className="block w-2 h-2 bg-nutri-yellow rounded-sm"></span>
                  <span className="block w-2 h-2 bg-nutri-yellow rounded-sm"></span>
                </span>
              </div>
              <h1 className="text-2xl font-bold">
                <span className="text-white">Nutri</span>
                <span className="text-nutri-yellow">Granja</span>
              </h1>
            </div>
            
            <div className="mb-6 md:mb-0">
              <ul className="flex flex-wrap justify-center gap-6">
                <li><a href="#" className="hover:text-nutri-yellow transition-colors">Inicio</a></li>
                <li><a href="#caracteristicas" className="hover:text-nutri-yellow transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-nutri-yellow transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-nutri-yellow transition-colors">Soporte</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p>&copy; 2024 NutriGranja. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
