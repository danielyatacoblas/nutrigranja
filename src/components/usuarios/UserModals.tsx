import React from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import UserForm from "./UserForm";
import { Usuario } from "@/types/database";

interface UserModalsProps {
  isModalOpen: boolean;
  isDeleteModalOpen: boolean;
  currentUsuario: Usuario | null;
  loading: boolean;
  formData: any;
  handleCloseModal: () => void;
  handleCloseDeleteModal: () => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleDelete: () => void;
}

export const UserModals: React.FC<UserModalsProps> = ({
  isModalOpen,
  isDeleteModalOpen,
  currentUsuario,
  loading,
  formData,
  handleCloseModal,
  handleCloseDeleteModal,
  handleInputChange,
  handleSubmit,
  handleDelete,
}) => {
  return (
    <>
      {/* Modal para agregar/editar usuario */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentUsuario ? "Editar Usuario" : "Agregar Usuario"}
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Usuario"}
            </Button>
          </>
        }
      >
        <UserForm
          formData={formData}
          currentUsuario={currentUsuario}
          loading={loading}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      </Modal>

      {/* Modal para confirmar eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Confirmar Acción"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseDeleteModal}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={loading}>
              {loading ? "Procesando..." : "Eliminar"}
            </Button>
          </>
        }
      >
        <p>
          ¿Está seguro que desea eliminar al usuario{" "}
          <strong>{currentUsuario?.usuario}</strong>? El usuario sera eliminado
          por completo del sistema
        </p>
      </Modal>
    </>
  );
};

export default UserModals;
