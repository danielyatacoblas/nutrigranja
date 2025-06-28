import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createUserWithConfirmedEmail } from "@/integrations/supabase/user-service";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Usuario, UserStatus, UserRole } from "@/types/database";
import { useAuth } from "@/context/AuthContext";

const useUserManagement = () => {
  const { user, userProfile } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [rolFilter, setRolFilter] = useState<UserRole | "todos">("todos");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "todos">(
    "todos"
  );
  const [dateFilter, setDateFilter] = useState<
    "recientes" | "antiguos" | "todos"
  >("todos");
  const [showFilters, setShowFilters] = useState(false);

  // Estados para modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    usuario: "",
    correo: "",
    nombres: "",
    apellidos: "",
    dni: "",
    telefono: "",
    rol: "usuario" as "admin" | "usuario",
    estado: "activo" as "activo" | "inactivo",
    contrasena: "",
    confirmarContrasena: "",
  });

  const fetchUsuarios = useCallback(async () => {
    // Verificar que el usuario esté autenticado y sea admin
    if (!user || !userProfile || userProfile.rol !== "admin") {
      console.log("Usuario no autorizado para obtener usuarios");
      setLoading(false);
      return;
    }

    // Evitar múltiples llamadas simultáneas
    if (fetchingRef.current) {
      console.log("Ya hay una consulta en progreso");
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);

      console.log("Obteniendo usuarios...");
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("fecha_registro", { ascending: false });

      if (error) {
        console.error("Error en consulta de usuarios:", error);
        throw error;
      }

      console.log("Usuarios obtenidos:", data?.length || 0);
      setUsuarios((data as Usuario[]) || []);
    } catch (error: any) {
      console.error("Error fetching usuarios:", error);
      toast.error(`Error al cargar usuarios: ${error.message}`);
      setUsuarios([]);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id, userProfile?.rol]); // Dependencias mínimas

  // Efecto principal para cargar usuarios
  useEffect(() => {
    // Solo ejecutar si tenemos usuario autenticado y perfil con rol admin
    if (user && userProfile && userProfile.rol === "admin") {
      console.log("Ejecutando fetchUsuarios...");
      fetchUsuarios();
    } else if (user && userProfile && userProfile.rol !== "admin") {
      console.log("Usuario no es admin, no cargando usuarios");
      setLoading(false);
      setUsuarios([]);
    } else {
      console.log("Usuario o perfil no disponible");
      setLoading(false);
    }
  }, [user?.id, userProfile?.rol]); // Solo depender de ID de usuario y rol

  // Filtrar usuarios usando useMemo para optimizar rendimiento
  const filteredUsuarios = useMemo(() => {
    let filtered = [...usuarios];

    // Filtrar al usuario actual para que no se muestre en la tabla
    if (user?.id) {
      filtered = filtered.filter((usuario) => usuario.id !== user.id);
    }

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (usuario) =>
          usuario.usuario?.toLowerCase().includes(term) ||
          usuario.nombres?.toLowerCase().includes(term) ||
          usuario.apellidos?.toLowerCase().includes(term) ||
          usuario.correo?.toLowerCase().includes(term) ||
          usuario.dni?.toLowerCase().includes(term) ||
          usuario.telefono?.toLowerCase().includes(term) ||
          `${usuario.nombres} ${usuario.apellidos}`
            .toLowerCase()
            .includes(term) ||
          `${usuario.apellidos} ${usuario.nombres}`.toLowerCase().includes(term)
      );
    }

    // Aplicar filtro por rol
    if (rolFilter !== "todos") {
      filtered = filtered.filter((usuario) => usuario.rol === rolFilter);
    }

    // Aplicar filtro por estado
    if (statusFilter !== "todos") {
      filtered = filtered.filter((usuario) => usuario.estado === statusFilter);
    }

    // Aplicar filtro por fecha
    if (dateFilter !== "todos") {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.fecha_registro).getTime();
        const dateB = new Date(b.fecha_registro).getTime();
        return dateFilter === "recientes" ? dateB - dateA : dateA - dateB;
      });
    }

    return filtered;
  }, [usuarios, user?.id, searchTerm, rolFilter, statusFilter, dateFilter]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setRolFilter("todos");
    setStatusFilter("todos");
    setDateFilter("todos");
  }, []);

  const handleOpenModal = useCallback((usuario?: Usuario) => {
    if (usuario) {
      const {
        usuario: username,
        nombres,
        apellidos,
        dni,
        telefono,
        estado,
        rol,
        correo,
      } = usuario;
      setFormData({
        usuario: username,
        correo: correo,
        nombres,
        apellidos,
        dni: dni || "",
        telefono: telefono || "",
        rol,
        estado,
        contrasena: "",
        confirmarContrasena: "",
      });
      setCurrentUsuario(usuario);
    } else {
      setFormData({
        usuario: "",
        correo: "",
        nombres: "",
        apellidos: "",
        dni: "",
        telefono: "",
        rol: "usuario",
        estado: "activo",
        contrasena: "",
        confirmarContrasena: "",
      });
      setCurrentUsuario(null);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentUsuario(null);
  }, []);

  const handleOpenDeleteModal = useCallback((usuario: Usuario) => {
    setCurrentUsuario(usuario);
    setIsDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setCurrentUsuario(null);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.correo.trim()) {
        toast.error("El campo Correo es obligatorio");
        return;
      }

      if (!formData.nombres.trim()) {
        toast.error("El campo Nombres es obligatorio");
        return;
      }

      if (!formData.apellidos.trim()) {
        toast.error("El campo Apellidos es obligatorio");
        return;
      }

      if (
        !currentUsuario &&
        (!formData.contrasena || formData.contrasena.length < 6)
      ) {
        toast.error("La contraseña debe tener al menos 6 caracteres");
        return;
      }

      if (
        !currentUsuario &&
        formData.contrasena !== formData.confirmarContrasena
      ) {
        toast.error("Las contraseñas no coinciden");
        return;
      }

      try {
        setLoading(true);

        if (currentUsuario) {
          const { error } = await supabase
            .from("usuarios")
            .update({
              usuario: formData.usuario.trim() || formData.correo.trim(),
              correo: formData.correo.trim(),
              nombres: formData.nombres.trim(),
              apellidos: formData.apellidos.trim(),
              dni: formData.dni.trim() || null,
              telefono: formData.telefono.trim() || null,
              estado: formData.estado,
              rol: formData.rol,
            })
            .eq("id", currentUsuario.id);

          if (error) throw error;
          toast.success("Usuario actualizado correctamente");
        } else {
          const { data, error } = await createUserWithConfirmedEmail(
            formData.correo.trim(),
            formData.contrasena,
            {
              usuario: formData.usuario.trim() || formData.correo.trim(),
              nombres: formData.nombres.trim(),
              apellidos: formData.apellidos.trim(),
              dni: formData.dni.trim() || undefined,
              telefono: formData.telefono.trim() || undefined,
              rol: formData.rol,
            }
          );

          if (error) {
            toast.error("Correo o usuario duplicado!" + error.message);
            console.error("Error al crear usuario correo duplicado:", error);
            return;
          }
          if (data && data.error) {
            toast.error(data.error);
            return;
          }
          toast.success("Usuario creado exitosamente");
        }

        fetchUsuarios();
        handleCloseModal();
      } catch (error: any) {
        const errorMessage = error.message || "Error desconocido";
        toast.error(`Error: ${errorMessage}`);
        console.error("Detalles completos del error:", error);
      } finally {
        setLoading(false);
      }
    },
    [currentUsuario, formData, fetchUsuarios, handleCloseModal]
  );

  const handleUpdateStatus = useCallback(
    async (usuario: Usuario, newStatus: UserStatus) => {
      try {
        setLoading(true);
        const { error } = await supabase
          .from("usuarios")
          .update({
            estado: newStatus,
          })
          .eq("id", usuario.id);

        if (error) throw error;
        toast.success(`Estado del usuario actualizado a ${newStatus}`);
        fetchUsuarios();
      } catch (error: any) {
        toast.error(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    },
    [fetchUsuarios]
  );

  const handleDelete = useCallback(async () => {
    if (currentUsuario) {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke("delete-user", {
          body: { id: currentUsuario.id },
        });

        if (error) throw new Error(error.message || error);
        if (data && data.error) throw new Error(data.error);

        toast.success("Usuario eliminado correctamente");
        fetchUsuarios();
        handleCloseDeleteModal();
      } catch (error: any) {
        toast.error(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  }, [currentUsuario, fetchUsuarios, handleCloseDeleteModal]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const exportUsersToCSV = useCallback(() => {
    try {
      const headers = [
        "Usuario",
        "Correo",
        "Nombres",
        "Apellidos",
        "DNI",
        "Teléfono",
        "Fecha Registro",
        "Estado",
        "Rol",
      ];

      const data = filteredUsuarios.map((user) => [
        user.usuario || "",
        user.correo || "",
        user.nombres || "",
        user.apellidos || "",
        user.dni || "",
        user.telefono || "",
        new Date(user.fecha_registro).toLocaleDateString(),
        user.estado,
        user.rol,
      ]);

      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `usuarios_${new Date().toISOString().slice(0, 10)}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Usuarios exportados correctamente a CSV");
    } catch (e) {
      const error = e as Error;
      toast.error(`Error al exportar usuarios: ${error.message}`);
    }
  }, [filteredUsuarios]);

  const exportUsersToExcel = useCallback(() => {
    try {
      const data = filteredUsuarios.map((user) => ({
        Usuario: user.usuario || "",
        Correo: user.correo || "",
        Nombres: user.nombres || "",
        Apellidos: user.apellidos || "",
        DNI: user.dni || "",
        Teléfono: user.telefono || "",
        "Fecha Registro": new Date(user.fecha_registro).toLocaleDateString(),
        Estado: user.estado === "activo" ? "Activo" : "Inactivo",
        Rol: user.rol === "admin" ? "Administrador" : "Usuario",
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");

      XLSX.writeFile(
        workbook,
        `usuarios_${new Date().toISOString().slice(0, 10)}.xlsx`
      );

      toast.success("Usuarios exportados correctamente a Excel");
    } catch (e) {
      const error = e as Error;
      toast.error(`Error al exportar usuarios: ${error.message}`);
    }
  }, [filteredUsuarios]);

  const exportUsersToPDF = useCallback(() => {
    try {
      const doc = new jsPDF();

      const title = "Reporte de Usuarios";
      doc.setFontSize(18);
      doc.text(title, 14, 22);

      doc.setFontSize(11);
      doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);

      const tableColumn = [
        "Usuario",
        "Correo",
        "Nombres",
        "Apellidos",
        "DNI",
        "Teléfono",
        "Fecha",
        "Estado",
        "Rol",
      ];
      const tableRows = filteredUsuarios.map((user) => [
        user.usuario || "",
        user.correo || "",
        user.nombres || "",
        user.apellidos || "",
        user.dni || "",
        user.telefono || "",
        new Date(user.fecha_registro).toLocaleDateString(),
        user.estado === "activo" ? "Activo" : "Inactivo",
        user.rol === "admin" ? "Administrador" : "Usuario",
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [75, 119, 71] },
        alternateRowStyles: { fillColor: [240, 247, 239] },
      });

      doc.save(`usuarios_${new Date().toISOString().slice(0, 10)}.pdf`);

      toast.success("Usuarios exportados correctamente a PDF");
    } catch (error: any) {
      toast.error(`Error al exportar usuarios: ${error.message}`);
    }
  }, [filteredUsuarios]);

  return {
    usuarios: filteredUsuarios,
    loading,
    isModalOpen,
    isDeleteModalOpen,
    currentUsuario,
    formData,
    searchTerm,
    rolFilter,
    statusFilter,
    dateFilter,
    showFilters,
    setShowFilters,
    setRolFilter,
    setStatusFilter,
    setDateFilter,
    handleOpenModal,
    handleCloseModal,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleInputChange,
    handleSubmit,
    handleUpdateStatus,
    handleDelete,
    handleSearch,
    handleResetFilters,
    exportUsersToCSV,
    exportUsersToExcel,
    exportUsersToPDF,
  };
};

export default useUserManagement;
