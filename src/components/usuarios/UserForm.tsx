import React, { useState } from "react";
import Button from "../common/Button";
import { Eye, EyeOff } from "lucide-react";
import { UserRole, UserStatus } from "@/types/database";

interface UserFormProps {
  formData: {
    usuario: string;
    correo: string;
    nombres: string;
    apellidos: string;
    dni: string;
    telefono: string;
    rol: UserRole;
    estado: UserStatus;
    contrasena: string;
    confirmarContrasena: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentUsuario: any | null;
  loading: boolean;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const UserForm: React.FC<UserFormProps> = ({
  formData,
  currentUsuario,
  loading,
  handleInputChange,
  handleSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 8) {
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          name: "dni",
          value: value,
        },
      };
      handleInputChange(newEvent);
    }
  };

  // Función para manejar entrada solo numérica en teléfono
  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Solo números
    if (value.length <= 9) {
      // Máximo 9 dígitos para teléfono peruano
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          name: "telefono",
          value: value,
        },
      };
      handleInputChange(newEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Usuario *
          </label>
          <input
            type="text"
            name="usuario"
            value={formData.usuario}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
            placeholder="Ingrese usuario"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo *
          </label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
            placeholder="ejemplo@correo.com"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombres *
          </label>
          <input
            type="text"
            name="nombres"
            value={formData.nombres}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
            placeholder="Ingrese nombres"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellidos *
          </label>
          <input
            type="text"
            name="apellidos"
            value={formData.apellidos}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
            placeholder="Ingrese apellidos"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DNI (máx. 8 dígitos)
          </label>
          <input
            type="text"
            name="dni"
            value={formData.dni}
            onChange={handleDniChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
            placeholder="12345678"
            disabled={loading}
            maxLength={8}
            pattern="[0-9]*"
            inputMode="numeric"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono (máx. 9 dígitos)
          </label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleTelefonoChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
            placeholder="987654321"
            disabled={loading}
            maxLength={9}
            pattern="[0-9]*"
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <select
          name="estado"
          value={formData.estado}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
          disabled={loading}
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rol *
        </label>
        <select
          name="rol"
          value={formData.rol}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
          disabled={loading}
        >
          <option value="usuario">Usuario</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      {!currentUsuario && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
                  placeholder="Ingrese contraseña"
                  disabled={loading}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repetir Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmarContrasena"
                  value={formData.confirmarContrasena}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
                  placeholder="Confirme contraseña"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </>
      )}

      {currentUsuario && (
        <div className="mt-6">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      )}
    </form>
  );
};

export default UserForm;
