import React, { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const RecoverPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor ingrese su correo electrónico");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Se han enviado instrucciones a su correo electrónico");
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Error al enviar el correo de recuperación");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80')",
      }}
    >
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
        <p className="text-center text-gray-600 mb-2">
          Sistema de Gestión Agrícola
        </p>

        <div className="mb-8">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center text-nutri-green hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" /> Volver al inicio de sesión
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
          Recuperar Contraseña
        </h2>

        {!submitted ? (
          <>
            <p className="text-gray-600 mb-6">
              Ingresa tu correo electrónico para recuperar tu contraseña
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
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

              <Button type="submit" className="w-full">
                Enviar instrucciones
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="text-nutri-green w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">¡Revisa tu correo!</h3>
            <p className="text-gray-600 mb-6">
              Hemos enviado instrucciones a <strong>{email}</strong> para
              recuperar tu contraseña.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Volver al inicio de sesión
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecoverPassword;
