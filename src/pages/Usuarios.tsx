
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, UsersRound } from "lucide-react";
import UsersTable from "../components/usuarios/UsersTable";
import UserModals from "../components/usuarios/UserModals";
import UserFilters from "../components/usuarios/UserFilters";
import useUserManagement from "../hooks/useUserManagement";

const Usuarios = () => {
  const userManagementProps = useUserManagement();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <UsersRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Usuarios
          </h1>
        </div>
        <Button
          onClick={() => userManagementProps.handleOpenModal()}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <UserPlus size={18} />
          Agregar Usuario
        </Button>
      </div>

      <Card className="overflow-hidden border-none shadow-md bg-white">
        <div className="bg-white p-6 border-b border-border/30">
          <UserFilters
            searchTerm={userManagementProps.searchTerm}
            handleSearch={userManagementProps.handleSearch}
            rolFilter={userManagementProps.rolFilter}
            setRolFilter={userManagementProps.setRolFilter}
            statusFilter={userManagementProps.statusFilter}
            setStatusFilter={userManagementProps.setStatusFilter}
            dateFilter={userManagementProps.dateFilter}
            setDateFilter={userManagementProps.setDateFilter}
            handleResetFilters={userManagementProps.handleResetFilters}
            showFilters={userManagementProps.showFilters}
            setShowFilters={userManagementProps.setShowFilters}
          />
        </div>

        <div className="p-6 bg-white">
          {userManagementProps.loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <UsersTable
              usuarios={userManagementProps.usuarios}
              handleOpenModal={userManagementProps.handleOpenModal}
              handleUpdateStatus={userManagementProps.handleUpdateStatus}
              handleOpenDeleteModal={userManagementProps.handleOpenDeleteModal}
              exportUsersToCSV={userManagementProps.exportUsersToCSV}
              exportUsersToPDF={userManagementProps.exportUsersToPDF}
              exportUsersToExcel={userManagementProps.exportUsersToExcel}
            />
          )}
        </div>
      </Card>

      <UserModals
        isModalOpen={userManagementProps.isModalOpen}
        isDeleteModalOpen={userManagementProps.isDeleteModalOpen}
        currentUsuario={userManagementProps.currentUsuario}
        loading={userManagementProps.loading}
        formData={userManagementProps.formData}
        handleCloseModal={userManagementProps.handleCloseModal}
        handleCloseDeleteModal={userManagementProps.handleCloseDeleteModal}
        handleInputChange={userManagementProps.handleInputChange}
        handleSubmit={userManagementProps.handleSubmit}
        handleDelete={userManagementProps.handleDelete}
      />
    </div>
  );
};

export default Usuarios;
