import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Modal from "@/components/common/Modal";
import {
  Tractor,
  UserPlus,
  Filter,
  ChevronDown,
  FileText,
  Search,
  X,
  Tags,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Proveedor, ProveedorTipo, AnyTable, anyFrom } from "@/types/database";
import ProveedorTipoModal from "../components/proveedores/ProveedorTipoModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import ProveedoresTable from "../components/proveedores/ProveedoresTable";
import PaisDocumentoModal from "../components/proveedores/PaisDocumentoModal";
import { SearchableCombobox } from "@/components/common/SearchableCombobox";
import {
  getAllPaises,
  getTiposDocumentoPorPais,
  validarFormatoDocumento,
} from "@/integrations/supabase/provider-service";
import { codigoPaisTelefono } from "@/data/codigo-paises";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorTipos, setProveedorTipos] = useState<ProveedorTipo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTipoModalOpen, setIsTipoModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPaisDocumentoModalOpen, setIsPaisDocumentoModalOpen] =
    useState(false);
  const [currentProveedor, setCurrentProveedor] = useState<Proveedor | null>(
    null
  );
  const [formData, setFormData] = useState({
    nombre: "",
    numero_documento: "",
    direccion: "",
    telefono: "",
    codigo_pais: "+51", // Nuevo campo para el código del país
    correo: "",
    tipo: "",
    pais: "Perú",
    tipo_documento: "RUC",
    activo: true,
  });

  // Nuevos estados para países y tipos de documento
  const [paises, setPaises] = useState<{ pais: string; codigo: string }[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tiposDocumento, setTiposDocumento] = useState<any[]>([]);
  const [formatoDocumento, setFormatoDocumento] = useState("");

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [calificacionFilter, setCalificacionFilter] = useState<string>("todos");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Nuevos filtros adicionales
  const [calificacionMinima, setCalificacionMinima] = useState("todas");
  const [direccionFiltro, setDireccionFiltro] = useState("");
  const [telefonoFiltro, setTelefonoFiltro] = useState("");
  const [correoFiltro, setCorreoFiltro] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchProveedores();
    fetchProveedorTipos();
    fetchPaises();
  }, []);

  useEffect(() => {
    // Cargar tipos de documento cuando cambia el país
    if (formData.pais) {
      fetchTiposDocumentoPorPais(formData.pais);

      // Actualizar el código de país para el teléfono
      const codigoPais = codigoPaisTelefono[formData.pais] || "";
      setFormData((prev) => ({
        ...prev,
        codigo_pais: codigoPais,
      }));
    }
  }, [formData.pais]);

  const fetchProveedores = async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await anyFrom<any>(supabase, "proveedor")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProveedores(data || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Error al cargar proveedores: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProveedorTipos = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await anyFrom<any>(supabase, "proveedor_tipo")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;
      setProveedorTipos(data || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Error al cargar tipos de proveedor: " + error.message);
    }
  };

  const fetchPaises = async () => {
    try {
      const data = await getAllPaises();
      setPaises(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Error al cargar países: " + error.message);
    }
  };

  const fetchTiposDocumentoPorPais = async (pais: string) => {
    try {
      const data = await getTiposDocumentoPorPais(pais);
      setTiposDocumento(data);

      // Si hay tipos de documento, seleccionar el primero por defecto
      if (data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          tipo_documento: data[0].tipo_documento,
        }));

        // Guardar el formato para validación
        setFormatoDocumento(data[0].formato);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Error al cargar tipos de documento: " + error.message);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.numero_documento.trim()) {
      newErrors.numero_documento = "El número de documento es requerido";
    }

    // Validación específica para el campo teléfono
    if (formData.telefono && !/^\d{1,15}$/.test(formData.telefono)) {
      newErrors.telefono =
        "El teléfono debe contener solo dígitos numéricos (máximo 15)";
    }

    if (!formData.correo.trim()) {
      newErrors.correo = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = "Ingrese un correo válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Validación especial para el campo teléfono (solo dígitos numéricos)
    if (name === "telefono") {
      // Solo aceptar dígitos y limitar a 15 caracteres
      const numericValue = value.replace(/\D/g, "").slice(0, 15);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    }
    // Actualizar formato de validación si cambia el tipo de documento
    else if (name === "tipo_documento") {
      const selectedDocType = tiposDocumento.find(
        (t) => t.tipo_documento === value
      );
      if (selectedDocType) {
        setFormatoDocumento(selectedDocType.formato);
      }
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Actualizar código de país si cambia el país
    else if (name === "pais") {
      const codigoPais = codigoPaisTelefono[value] || "";
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        codigo_pais: codigoPais,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Limpiar error del campo específico
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleTipoChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      tipo: value,
    }));
  };

  const tipoProveedorOptions = React.useMemo(() => {
    return proveedorTipos.map((tipo) => ({
      value: tipo.nombre,
      label: tipo.nombre,
    }));
  }, [proveedorTipos]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Validar formato del documento
    const isFormatValid = await validarFormatoDocumento(
      formData.tipo_documento,
      formData.numero_documento,
      formData.pais
    );

    if (!isFormatValid) {
      setErrors((prev) => ({
        ...prev,
        numero_documento: `El formato del documento no es válido para ${formData.tipo_documento} de ${formData.pais}`,
      }));
      return;
    }

    // Formato del teléfono con código de país para guardar en la base de datos
    const formattedData = {
      ...formData,
    };

    try {
      if (currentProveedor) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await anyFrom<any>(supabase, "proveedor")
          .update({
            nombre: formData.nombre,
            numero_documento: formData.numero_documento,
            direccion: formData.direccion,
            telefono: formData.telefono,
            codigo_pais: formData.codigo_pais,
            correo: formData.correo,
            tipo: formData.tipo,
            pais: formData.pais,
            tipo_documento: formData.tipo_documento,
            activo: formData.activo,
          })
          .eq("id", currentProveedor.id);

        if (error) throw error;
        toast.success("Proveedor actualizado correctamente");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await anyFrom<any>(supabase, "proveedor").insert([
          {
            nombre: formData.nombre,
            numero_documento: formData.numero_documento,
            direccion: formData.direccion,
            telefono: formData.telefono,
            codigo_pais: formData.codigo_pais,
            correo: formData.correo,
            tipo: formData.tipo,
            pais: formData.pais,
            tipo_documento: formData.tipo_documento,
            activo: formData.activo,
          },
        ]);

        if (error) throw error;
        toast.success("Proveedor agregado correctamente");
      }

      handleCloseModal();
      fetchProveedores();
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Error al guardar el proveedor");
    }
  };

  const handleDelete = async () => {
    if (currentProveedor) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await anyFrom<any>(supabase, "proveedor")
          .delete()
          .eq("id", currentProveedor.id);

        if (error) throw error;
        toast.success("Proveedor eliminado correctamente");
        handleCloseDeleteModal();
        fetchProveedores();
      } catch (e) {
        const error = e as Error;
        toast.error(error.message || "Error al eliminar el proveedor");
      }
    }
  };

  const handleOpenModal = (proveedor?: Proveedor) => {
    if (proveedor) {
      // Extraer código de país y teléfono si existe
      const telefono = proveedor.telefono || "";
      const codigoPais = codigoPaisTelefono[proveedor.pais || "Perú"] || "+51";

      setFormData({
        nombre: proveedor.nombre || "",
        numero_documento: proveedor.numero_documento || "",
        direccion: proveedor.direccion || "",
        telefono: telefono,
        codigo_pais: codigoPais,
        correo: proveedor.correo || "",
        tipo: proveedor.tipo || "",
        pais: proveedor.pais || "Perú",
        tipo_documento: proveedor.tipo_documento || "RUC",
        activo: proveedor.activo !== undefined ? proveedor.activo : true,
      });
      setCurrentProveedor(proveedor);

      // Cargar tipos de documento para el país del proveedor
      fetchTiposDocumentoPorPais(proveedor.pais || "Perú");
    } else {
      setFormData({
        nombre: "",
        numero_documento: "",
        direccion: "",
        telefono: "",
        codigo_pais: "+51",
        correo: "",
        tipo: "",
        pais: "Perú",
        tipo_documento: "RUC",
        activo: true,
      });
      setCurrentProveedor(null);

      // Cargar tipos de documento para Perú por defecto
      fetchTiposDocumentoPorPais("Perú");
    }
    setIsModalOpen(true);
  };

  const handleOpenTipoModal = () => {
    setIsTipoModalOpen(true);
  };

  const handleCloseTipoModal = () => {
    setIsTipoModalOpen(false);
    fetchProveedorTipos();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrors({});
    setCurrentProveedor(null);
  };

  const handleOpenDeleteModal = (proveedor: Proveedor) => {
    setCurrentProveedor(proveedor);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentProveedor(null);
  };

  const handleOpenPaisDocumentoModal = () => {
    setIsPaisDocumentoModalOpen(true);
  };

  const handleClosePaisDocumentoModal = () => {
    setIsPaisDocumentoModalOpen(false);
    // Refresh países after changes
    fetchPaises();
  };

  // Nuevas funciones para el manejo de filtros
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setTipoFilter("todos");
    setCalificacionFilter("todos");
    setCalificacionMinima("todas");
    setDireccionFiltro("");
    setTelefonoFiltro("");
    setCorreoFiltro("");
  };

  // Funciones para exportación
  const exportProveedoresToCSV = () => {
    toast.success("Exportando proveedores a CSV...");
    // Implementación pendiente
  };

  const exportProveedoresToExcel = () => {
    toast.success("Exportando proveedores a Excel...");
    // Implementación pendiente
  };

  const exportProveedoresToPDF = () => {
    toast.success("Exportando proveedores a PDF...");
    // Implementación pendiente
  };

  // Enhanced filtrar proveedores with new filters
  const filteredProveedores = proveedores.filter((proveedor) => {
    const matchesSearch =
      searchTerm === "" ||
      proveedor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.numero_documento
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      proveedor.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.direccion?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = tipoFilter === "todos" || proveedor.tipo === tipoFilter;

    const matchesCalificacion =
      calificacionFilter === "todos" ||
      (calificacionFilter === "alta" && (proveedor.calificacion || 0) >= 4) ||
      (calificacionFilter === "media" &&
        (proveedor.calificacion || 0) >= 3 &&
        (proveedor.calificacion || 0) < 4) ||
      (calificacionFilter === "baja" && (proveedor.calificacion || 0) < 3);

    // Nuevos filtros
    const matchesCalificacionMinima =
      calificacionMinima === "todas" ||
      (proveedor.calificacion || 0) >= parseFloat(calificacionMinima);

    const matchesDireccion =
      direccionFiltro === "" ||
      proveedor.direccion
        ?.toLowerCase()
        .includes(direccionFiltro.toLowerCase());

    const matchesTelefono =
      telefonoFiltro === "" ||
      proveedor.telefono?.toLowerCase().includes(telefonoFiltro.toLowerCase());

    const matchesCorreo =
      correoFiltro === "" ||
      proveedor.correo?.toLowerCase().includes(correoFiltro.toLowerCase());

    return (
      matchesSearch &&
      matchesTipo &&
      matchesCalificacion &&
      matchesCalificacionMinima &&
      matchesDireccion &&
      matchesTelefono &&
      matchesCorreo
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Tractor className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Proveedores
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenPaisDocumentoModal}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <Globe size={18} />
            Países y Documentos
          </Button>
          <Button
            onClick={handleOpenTipoModal}
            className="gap-2 bg-primary/80 hover:bg-primary/90"
          >
            <Tags size={18} />
            Tipos de Proveedor
          </Button>
          <Button
            onClick={() => handleOpenModal()}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <UserPlus size={18} />
            Agregar Proveedor
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-md bg-white">
        <div className="bg-white p-6 border-b border-border/30">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative w-full md:w-64">
                <Input
                  placeholder="Buscar proveedores..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-white border-input focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-2 bg-white ${
                    showFilters
                      ? "border-primary/70 text-primary"
                      : "border-muted"
                  }`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter
                    size={16}
                    className={
                      showFilters ? "text-primary" : "text-muted-foreground"
                    }
                  />
                  {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                  {showFilters ? (
                    <ChevronDown
                      size={16}
                      className="rotate-180 transition-transform"
                    />
                  ) : (
                    <ChevronDown size={16} className="transition-transform" />
                  )}
                </Button>

                {(tipoFilter !== "todos" ||
                  calificacionFilter !== "todos" ||
                  calificacionMinima !== "todas" ||
                  direccionFiltro ||
                  telefonoFiltro ||
                  correoFiltro) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground bg-white"
                  >
                    <X size={16} />
                    Borrar filtros
                  </Button>
                )}
              </div>
            </div>

            <Collapsible open={showFilters}>
              <CollapsibleContent className="pt-4 pb-2 space-y-4 border-t border-border/40 animate-accordion-down">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Proveedor
                    </label>
                    <select
                      name="tipo"
                      value={tipoFilter}
                      onChange={(e) => setTipoFilter(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
                    >
                      <option value="todos">Todos los tipos</option>
                      {proveedorTipos.map((tipo) => (
                        <option key={tipo.id} value={tipo.nombre}>
                          {tipo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calificación
                    </label>
                    <Select
                      value={calificacionFilter}
                      onValueChange={setCalificacionFilter}
                    >
                      <SelectTrigger className="w-full bg-white border-input focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Todas las calificaciones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">
                          Todas las calificaciones
                        </SelectItem>
                        <SelectItem value="alta">Alta (4-5)</SelectItem>
                        <SelectItem value="media">Media (3-3.9)</SelectItem>
                        <SelectItem value="baja">Baja (0-2.9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Nueva fila de filtros adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calificación Mínima
                    </label>
                    <Select
                      value={calificacionMinima}
                      onValueChange={setCalificacionMinima}
                    >
                      <SelectTrigger className="w-full bg-white border-input focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="4">4+ estrellas</SelectItem>
                        <SelectItem value="3">3+ estrellas</SelectItem>
                        <SelectItem value="2">2+ estrellas</SelectItem>
                        <SelectItem value="1">1+ estrellas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <Input
                      type="text"
                      placeholder="Filtrar por dirección"
                      value={direccionFiltro}
                      onChange={(e) => setDireccionFiltro(e.target.value)}
                      className="w-full bg-white border-input focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <Input
                      type="text"
                      placeholder="Filtrar por teléfono"
                      value={telefonoFiltro}
                      onChange={(e) => setTelefonoFiltro(e.target.value)}
                      className="w-full bg-white border-input focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo
                    </label>
                    <Input
                      type="text"
                      placeholder="Filtrar por correo"
                      value={correoFiltro}
                      onChange={(e) => setCorreoFiltro(e.target.value)}
                      className="w-full bg-white border-input focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        <div className="p-6 bg-white">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ProveedoresTable
              proveedores={filteredProveedores}
              proveedorTipos={proveedorTipos}
              handleOpenModal={handleOpenModal}
              handleOpenDeleteModal={handleOpenDeleteModal}
              exportProveedoresToCSV={exportProveedoresToCSV}
              exportProveedoresToPDF={exportProveedoresToPDF}
              exportProveedoresToExcel={exportProveedoresToExcel}
              loading={loading}
            />
          )}
        </div>
      </Card>

      {/* Modal para agregar o editar proveedor */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentProveedor ? "Editar Proveedor" : "Agregar Proveedor"}
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre/Razón Social*
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={`w-full p-2 border ${
                  errors.nombre ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green`}
                placeholder="Ingrese nombre o razón social"
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País*
              </label>
              <select
                name="pais"
                value={formData.pais}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
              >
                {paises.map((pais) => (
                  <option key={pais.codigo} value={pais.pais}>
                    {pais.pais}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento*
              </label>
              <select
                name="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
              >
                {tiposDocumento.map((tipo) => (
                  <option key={tipo.id} value={tipo.tipo_documento}>
                    {tipo.tipo_documento} - {tipo.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Documento*
              </label>
              <input
                type="text"
                name="numero_documento"
                value={formData.numero_documento}
                onChange={handleInputChange}
                className={`w-full p-2 border ${
                  errors.numero_documento ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green`}
                placeholder={`Ingrese ${formData.tipo_documento}`}
              />
              {errors.numero_documento && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.numero_documento}
                </p>
              )}
              {formatoDocumento && (
                <p className="text-gray-500 text-xs mt-1">
                  Formato requerido:{" "}
                  {formatoDocumento.replace("^", "").replace("$", "")}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="tipo" className="block text-sm font-medium mb-1">
                Tipo <span className="text-red-500">*</span>
              </label>
              <SearchableCombobox
                options={tipoProveedorOptions}
                value={formData.tipo}
                onChange={handleTipoChange}
                placeholder="Seleccionar tipo"
                searchPlaceholder="Buscar tipo..."
                emptyMessage="No se encontraron tipos."
              />
              {errors.tipo && (
                <p className="text-red-500 text-xs mt-1">{errors.tipo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
                placeholder="Ingrese dirección"
              />
            </div>

            {/* Campo de teléfono modificado para incluir código de país */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <div className="flex items-center">
                <div className="w-20">
                  <input
                    type="text"
                    value={formData.codigo_pais}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-l-md bg-gray-100 focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${
                    errors.telefono ? "border-red-500" : "border-gray-300"
                  } rounded-r-md focus:outline-none focus:ring-1 focus:ring-nutri-green`}
                  placeholder="Número telefónico"
                  maxLength={15}
                />
              </div>
              {errors.telefono && (
                <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Solo dígitos numéricos (máximo 15)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo*
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                className={`w-full p-2 border ${
                  errors.correo ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green`}
                placeholder="ejemplo@correo.com"
              />
              {errors.correo && (
                <p className="text-red-500 text-xs mt-1">{errors.correo}</p>
              )}
            </div>

            {/* Add a checkbox for proveedor status (activo/inactivo) */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formData.activo}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-nutri-green focus:ring-nutri-green"
              />
              <label
                htmlFor="activo"
                className="text-sm font-medium text-gray-700"
              >
                Proveedor activo
              </label>
              <div className="ml-2">
                {formData.activo ? (
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    Inactivo
                  </span>
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal para gestionar tipos de proveedor */}
      <ProveedorTipoModal
        isOpen={isTipoModalOpen}
        onClose={handleCloseTipoModal}
        onSave={fetchProveedorTipos}
        proveedorTipos={proveedorTipos}
      />

      {/* Modal for managing countries and document types */}
      <PaisDocumentoModal
        isOpen={isPaisDocumentoModalOpen}
        onClose={handleClosePaisDocumentoModal}
      />

      {/* Modal for confirmar eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Confirmar Eliminación"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseDeleteModal}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </>
        }
      >
        <p>
          ¿Está seguro que desea eliminar al proveedor{" "}
          <strong>{currentProveedor?.nombre}</strong>? Esta acción no se puede
          deshacer.
        </p>
      </Modal>
    </div>
  );
};

export default Proveedores;
