/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Modal from "@/components/common/Modal";
import {
  Apple,
  Plus,
  Filter,
  ChevronDown,
  FileText,
  Search,
  X,
  Upload,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  supabase,
  productosWithRelations,
  getTiposProducto,
  createTipoProducto,
  deleteTipoProducto,
  getUnitsOfMeasure,
} from "@/integrations/supabase/client";
import {
  Producto,
  Proveedor,
  UnitOfMeasure,
  AnyTable,
  anyFrom,
} from "@/types/database";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import ProductosTable from "../components/productos/ProductosTable";
import TiposProductoTable from "../components/productos/TiposProductoTable";
import { SearchableCombobox } from "@/components/common/SearchableCombobox";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  formatProductosForExport,
} from "@/utils/exportUtils";

const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [tiposProducto, setTiposProducto] = useState<string[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTipoModalOpen, setIsTipoModalOpen] = useState(false);
  const [isManageTiposModalOpen, setIsManageTiposModalOpen] = useState(false);
  const [currentProducto, setCurrentProducto] = useState<Producto | null>(null);
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [descripcionTipo, setDescripcionTipo] = useState("");

  // Estado para formularios y carga
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    proveedor_id: "",
    peso: "",
    tiempo_entrega_desde: "",
    tiempo_entrega_hasta: "",
    imagen_url: "",
    precio: "",
    stock: "0",
    stock_alert: "10",
    unit_of_measure: "UNIDAD",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isNewImage, setIsNewImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [proveedorFilter, setProveedorFilter] = useState<string>("todos");
  // Nuevos filtros
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [pesoUnidad, setPesoUnidad] = useState("");
  const [estadoStock, setEstadoStock] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // File input reference
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Opciones para los combobox
  const proveedorOptions = React.useMemo(
    () =>
      proveedores.map((p) => ({
        value: p.id,
        label: p.nombre,
      })),
    [proveedores]
  );

  const tipoProductoOptions = React.useMemo(
    () =>
      tiposProducto.map((t) => ({
        value: t,
        label: t,
      })),
    [tiposProducto]
  );

  const unitOfMeasureOptions = React.useMemo(
    () =>
      unitsOfMeasure.map((u) => ({
        value: u.code,
        label: `${u.name} (${u.code})`,
      })),
    [unitsOfMeasure]
  );

  useEffect(() => {
    fetchProductos();
    fetchProveedores();
    fetchTiposProducto();
    fetchUnitsOfMeasure();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const { data, error } = await productosWithRelations();

      if (error) throw error;
      setProductos(data || []);
    } catch (error: any) {
      toast.error("Error al cargar productos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProveedores = async () => {
    try {
      const { data, error } = await supabase
        .from("proveedor")
        .select("*")
        .order("nombre");

      if (error) throw error;
      setProveedores(data || []);
    } catch (error: any) {
      toast.error("Error al cargar proveedores: " + error.message);
    }
  };

  const fetchTiposProducto = async () => {
    try {
      const { data, error } = await getTiposProducto();
      if (error) throw error;
      setTiposProducto(data.map((item: any) => item.nombre));
    } catch (error: any) {
      toast.error("Error al cargar tipos de producto: " + error.message);
    }
  };

  const fetchUnitsOfMeasure = async () => {
    try {
      const { data, error } = await getUnitsOfMeasure();

      if (error) throw error;
      setUnitsOfMeasure(data || []);
    } catch (error: any) {
      toast.error("Error al cargar unidades de medida: " + error.message);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    // El tipo ya no es requerido

    // El proveedor sigue siendo requerido
    if (!formData.proveedor_id) {
      newErrors.proveedor_id = "El proveedor es requerido";
    }

    if (
      formData.tiempo_entrega_desde &&
      !/^\d+$/.test(formData.tiempo_entrega_desde)
    ) {
      newErrors.tiempo_entrega_desde = "Ingrese un número válido";
    }

    if (
      formData.tiempo_entrega_hasta &&
      !/^\d+$/.test(formData.tiempo_entrega_hasta)
    ) {
      newErrors.tiempo_entrega_hasta = "Ingrese un número válido";
    }

    if (formData.precio && !/^\d+(\.\d{1,2})?$/.test(formData.precio)) {
      newErrors.precio = "Ingrese un precio válido";
    }

    if (!/^\d+$/.test(formData.stock)) {
      newErrors.stock = "Ingrese un número válido para el stock";
    }

    if (!/^\d+$/.test(formData.stock_alert)) {
      newErrors.stock_alert =
        "Ingrese un número válido para la alerta de stock";
    }

    // La imagen ya no es requerida

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile && !isNewImage) {
      // Si no hay una nueva imagen, devuelve la URL existente (si existe)
      return currentProducto?.imagen_url || null;
    }

    if (!imageFile) {
      return selectedImage;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // Simulamos progreso de carga
      const simulateProgress = () => {
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return prev;
            }
            return prev + 10;
          });
        }, 300);
        return interval;
      };

      const progressInterval = simulateProgress();

      // Subir imagen a Supabase Storage
      const { data, error } = await supabase.storage
        .from("producto")
        .upload(filePath, imageFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from("producto")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (e) {
      const error = e as Error;
      toast.error("Error al subir la imagen: " + error.message);
      return null;
    } finally {
      // Retraso para mostrar el 100% brevemente
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Subir imagen primero
      const imageUrl = await uploadImage();

      const dataToSend = {
        ...formData,
        tiempo_entrega_desde: formData.tiempo_entrega_desde
          ? parseInt(formData.tiempo_entrega_desde)
          : null,
        tiempo_entrega_hasta: formData.tiempo_entrega_hasta
          ? parseInt(formData.tiempo_entrega_hasta)
          : null,
        imagen_url: imageUrl,
        precio: formData.precio ? parseFloat(formData.precio) : 0,
        stock: parseInt(formData.stock),
        stock_alert: parseInt(formData.stock_alert),
      };

      if (currentProducto) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await anyFrom<any>(supabase, "producto")
          .update(dataToSend)
          .eq("id", currentProducto.id);

        if (error) throw error;
        toast.success("Producto actualizado correctamente");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await anyFrom<any>(supabase, "producto").insert([
          dataToSend,
        ]);

        if (error) throw error;
        toast.success("Producto agregado correctamente");
      }

      handleCloseModal();
      fetchProductos();
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Error al guardar el producto");
    }
  };

  const handleAgregarTipo = async () => {
    if (!nuevoTipo.trim()) {
      toast.error("Debes ingresar un nombre para el tipo de producto");
      return;
    }

    try {
      // Usar el nuevo servicio para crear tipos de producto
      const { error } = await createTipoProducto(nuevoTipo, descripcionTipo);

      if (error) throw error;

      // Actualizar la lista local
      if (!tiposProducto.includes(nuevoTipo)) {
        setTiposProducto([...tiposProducto, nuevoTipo]);
      }

      setIsTipoModalOpen(false);
      setNuevoTipo("");
      setDescripcionTipo("");
      toast.success("Tipo de producto agregado correctamente");

      // Refrescar la lista de tipos después de agregar uno nuevo
      fetchTiposProducto();
    } catch (error: any) {
      toast.error("Error al agregar el tipo de producto: " + error.message);
    }
  };

  const handleEliminarTipo = async (tipoAEliminar: string) => {
    try {
      // Primero obtener el ID del tipo por nombre
      const { data: tipoData } = await supabase
        .from("tipo_productos")
        .select("id")
        .eq("nombre", tipoAEliminar)
        .single();

      if (tipoData) {
        // Ahora podemos eliminar usando el ID
        const { error } = await deleteTipoProducto(tipoData.id);
        if (error) throw error;

        // Actualizar la lista local
        setTiposProducto(
          tiposProducto.filter((tipo) => tipo !== tipoAEliminar)
        );
        toast.success("Tipo de producto eliminado");

        // Refrescar la lista de tipos
        fetchTiposProducto();
      }
    } catch (error: any) {
      toast.error("Error al eliminar el tipo de producto: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (currentProducto) {
      try {
        // Si tiene imagen, intentar eliminarla del storage
        if (currentProducto.imagen_url) {
          const fileName = currentProducto.imagen_url.split("/").pop();
          if (fileName) {
            await supabase.storage.from("producto").remove([fileName]);
          }
        }

        // Corrected table name from 'productos' to 'producto'
        const { error } = await anyFrom<any>(supabase, "producto")
          .delete()
          .eq("id", currentProducto.id);

        if (error) throw error;
        toast.success("Producto eliminado correctamente");
        handleCloseDeleteModal();
        fetchProductos();
      } catch (error: any) {
        toast.error(error.message || "Error al eliminar el producto");
      }
    }
  };

  const handleOpenModal = (producto?: Producto) => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || "",
        tipo: producto.tipo || "",
        proveedor_id: producto.proveedor_id || "",
        peso: producto.peso || "",
        tiempo_entrega_desde: producto.tiempo_entrega_desde
          ? String(producto.tiempo_entrega_desde)
          : "",
        tiempo_entrega_hasta: producto.tiempo_entrega_hasta
          ? String(producto.tiempo_entrega_hasta)
          : "",
        imagen_url: producto.imagen_url || "",
        precio: producto.precio ? String(producto.precio) : "",
        stock: String(producto.stock),
        stock_alert: String(producto.stock_alert),
        unit_of_measure: producto.unit_of_measure || "UNIDAD",
      });
      setCurrentProducto(producto);
      setSelectedImage(producto.imagen_url);
      setIsNewImage(false);
    } else {
      setFormData({
        nombre: "",
        tipo: "",
        proveedor_id: "",
        peso: "",
        tiempo_entrega_desde: "",
        tiempo_entrega_hasta: "",
        imagen_url: "",
        precio: "",
        stock: "0",
        stock_alert: "10",
        unit_of_measure: "UNIDAD",
      });
      setCurrentProducto(null);
      setSelectedImage(null);
      setIsNewImage(false);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProducto(null);
    setSelectedImage(null);
    setIsNewImage(false);
    setImageFile(null);
  };

  const handleOpenDeleteModal = (producto: Producto) => {
    setCurrentProducto(producto);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentProducto(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo específico
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir números con hasta 2 decimales
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          name: "precio",
          value: value,
        },
      };
      handleInputChange(newEvent);
    }
  };

  const handleTiempoEntregaChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value = e.target.value.replace(/\D/g, ""); // Solo números
    if (value.length <= 3) {
      // Máximo 3 dígitos para días
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          name: field,
          value: value,
        },
      };
      handleInputChange(newEvent);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      // Validate file type
      const fileType = file.type;
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];

      if (!validImageTypes.includes(fileType)) {
        toast.error(
          "Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP, SVG)"
        );
        return;
      }

      // Check file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("La imagen es demasiado grande. El tamaño máximo es 5MB.");
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setIsNewImage(true);
      };
      reader.readAsDataURL(file);

      // Limpiar error de imagen si existe
      if (errors.imagen) {
        setErrors((prev) => ({
          ...prev,
          imagen: "",
        }));
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Nuevas funciones para el manejo de filtros
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setTipoFilter("todos");
    setProveedorFilter("todos");
    setPrecioMin("");
    setPrecioMax("");
    setPesoUnidad("");
    setEstadoStock("all");
  };

  // Export functions with implementation
  const exportProductosToCSV = () => {
    try {
      const formattedData = formatProductosForExport(productos);
      exportToCSV(
        formattedData,
        `productos_${new Date().toISOString().split("T")[0]}`
      );
      toast.success("Productos exportados a CSV correctamente");
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast.error("Error al exportar a CSV");
    }
  };

  const exportProductosToExcel = () => {
    try {
      const formattedData = formatProductosForExport(productos);
      exportToExcel(
        formattedData,
        `productos_${new Date().toISOString().split("T")[0]}`
      );
      toast.success("Productos exportados a Excel correctamente");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Error al exportar a Excel");
    }
  };

  const exportProductosToPDF = () => {
    try {
      const formattedData = formatProductosForExport(productos);
      const columns = Object.keys(formattedData[0] || {}).map((key) => ({
        header: key,
        dataKey: key,
      }));

      exportToPDF(
        formattedData,
        `productos_${new Date().toISOString().split("T")[0]}`,
        "Reporte de Productos",
        columns
      );
      toast.success("Productos exportados a PDF correctamente");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Error al exportar a PDF");
    }
  };

  // Helper function to get stock status
  const getStockStatus = (stock: number, stockAlert: number) => {
    if (stock <= 0) {
      return "sin_stock";
    } else if (stock <= stockAlert) {
      return "por_acabarse";
    } else {
      return "estable";
    }
  };

  // Filtrar productos con los nuevos filtros
  const filteredProductos = productos.filter((producto) => {
    const matchesSearch =
      searchTerm === "" ||
      producto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.peso?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = tipoFilter === "todos" || producto.tipo === tipoFilter;

    const matchesProveedor =
      proveedorFilter === "todos" || producto.proveedor_id === proveedorFilter;

    // Filtro por precio
    const precio = producto.precio || 0;
    const matchesPrecioMin =
      precioMin === "" || precio >= parseFloat(precioMin);
    const matchesPrecioMax =
      precioMax === "" || precio <= parseFloat(precioMax);

    // Filtro por peso/unidad
    const matchesPesoUnidad =
      pesoUnidad === "" ||
      producto.peso?.toLowerCase().includes(pesoUnidad.toLowerCase()) ||
      producto.unit_of_measure
        ?.toLowerCase()
        .includes(pesoUnidad.toLowerCase());

    // Filtro por estado de stock
    const stockStatus = getStockStatus(producto.stock, producto.stock_alert);
    const matchesEstadoStock =
      estadoStock === "all" || stockStatus === estadoStock;

    return (
      matchesSearch &&
      matchesTipo &&
      matchesProveedor &&
      matchesPrecioMin &&
      matchesPrecioMax &&
      matchesPesoUnidad &&
      matchesEstadoStock
    );
  });

  const hasActiveFilters =
    tipoFilter !== "todos" ||
    proveedorFilter !== "todos" ||
    precioMin !== "" ||
    precioMax !== "" ||
    pesoUnidad !== "" ||
    estadoStock !== "all";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Apple className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Productos
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => handleOpenModal()}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus size={18} />
            Agregar Producto
          </Button>
          <Button
            onClick={() => setIsManageTiposModalOpen(true)}
            variant="outline"
            className="gap-2 border-primary/40 hover:border-primary bg-white"
          >
            Gestionar Tipos
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-md bg-white">
        <div className="bg-white p-6 border-b border-border/30">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative w-full md:w-64">
                <Input
                  placeholder="Buscar productos..."
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

                {hasActiveFilters && (
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
                      Tipo de Producto
                    </label>
                    <Select value={tipoFilter} onValueChange={setTipoFilter}>
                      <SelectTrigger className="w-full bg-white border-input focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los tipos</SelectItem>
                        {tiposProducto.map((tipo, index) => (
                          <SelectItem key={index} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proveedor
                    </label>
                    <Select
                      value={proveedorFilter}
                      onValueChange={setProveedorFilter}
                    >
                      <SelectTrigger className="w-full bg-white border-input focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Todos los proveedores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">
                          Todos los proveedores
                        </SelectItem>
                        {proveedores.map((proveedor) => (
                          <SelectItem key={proveedor.id} value={proveedor.id}>
                            {proveedor.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rango de Precio
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Mín"
                        value={precioMin}
                        onChange={(e) => setPrecioMin(e.target.value)}
                        className="bg-white border-input focus:ring-primary focus:border-primary"
                        min="0"
                        step="0.01"
                      />
                      <span className="text-gray-500">-</span>
                      <Input
                        type="number"
                        placeholder="Máx"
                        value={precioMax}
                        onChange={(e) => setPrecioMax(e.target.value)}
                        className="bg-white border-input focus:ring-primary focus:border-primary"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peso/Unidad
                    </label>
                    <Input
                      type="text"
                      placeholder="Ej: kg, saco, litro..."
                      value={pesoUnidad}
                      onChange={(e) => setPesoUnidad(e.target.value)}
                      className="bg-white border-input focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado del Stock
                    </label>
                    <Select value={estadoStock} onValueChange={setEstadoStock}>
                      <SelectTrigger className="w-full bg-white border-input focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="sin_stock">Sin stock</SelectItem>
                        <SelectItem value="por_acabarse">
                          Por acabarse
                        </SelectItem>
                        <SelectItem value="estable">Estable</SelectItem>
                      </SelectContent>
                    </Select>
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
            <ProductosTable
              productos={filteredProductos}
              handleOpenModal={handleOpenModal}
              handleOpenDeleteModal={handleOpenDeleteModal}
              exportProductosToCSV={exportProductosToCSV}
              exportProductosToPDF={exportProductosToPDF}
              exportProductosToExcel={exportProductosToExcel}
            />
          )}
        </div>
      </Card>

      {/* Modal para agregar/editar producto */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          currentProducto ? "Editar Materia Prima" : "Agregar Materia Prima"
        }
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" form="productForm">
              Guardar
            </Button>
          </>
        }
      >
        <form
          id="productForm"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className="space-y-4"
        >
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
                {isUploading && (
                  <div className="w-full mb-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-nutri-green"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Subiendo imagen... {uploadProgress}%
                    </p>
                  </div>
                )}

                {selectedImage ? (
                  <div className="relative w-full h-48 mb-4">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setIsNewImage(true);
                        setImageFile(null);
                        setFormData((prev) => ({ ...prev, imagen_url: "" }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center w-full h-48 cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    <Upload className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 text-center">
                      {currentProducto
                        ? "Cambia la imagen o deja vacío para mantener la actual"
                        : "Arrastra una imagen o haz clic para seleccionar (JPG, PNG, GIF)"}
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg, image/png, image/gif, image/webp, image/svg+xml"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              {errors.imagen && (
                <p className="text-red-500 text-xs mt-1">{errors.imagen}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={`w-full p-2 border ${
                  errors.nombre ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green`}
                placeholder="Nombre del Producto"
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${
                    errors.stock ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green`}
                  placeholder="0"
                  min="0"
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alerta de Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock_alert"
                  value={formData.stock_alert}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${
                    errors.stock_alert ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green`}
                  placeholder="10"
                  min="0"
                />
                {errors.stock_alert && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock_alert}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción de Peso <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="peso"
                  value={formData.peso}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
                  placeholder="Ej: Saco de 50kg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad de Medida (SUNAT){" "}
                  <span className="text-red-500">*</span>
                </label>
                <SearchableCombobox
                  options={unitOfMeasureOptions}
                  value={formData.unit_of_measure}
                  onChange={(value) =>
                    handleInputChange({
                      target: { name: "unit_of_measure", value },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                  placeholder="Seleccionar unidad"
                  searchPlaceholder="Buscar unidad..."
                  emptyMessage="No se encontraron unidades."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="precio"
                value={formData.precio}
                onChange={handlePrecioChange}
                className={`w-full p-2 border ${
                  errors.precio ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green`}
                placeholder="0.00"
                inputMode="decimal"
              />
              {errors.precio && (
                <p className="text-red-500 text-xs mt-1">{errors.precio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiempo de Entrega (días)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  name="tiempo_entrega_desde"
                  className={`w-full p-2 border ${
                    errors.tiempo_entrega_desde
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green`}
                  placeholder="Desde"
                  value={formData.tiempo_entrega_desde}
                  onChange={(e) =>
                    handleTiempoEntregaChange(e, "tiempo_entrega_desde")
                  }
                  maxLength={3}
                  inputMode="numeric"
                />
                <span>—</span>
                <input
                  type="text"
                  name="tiempo_entrega_hasta"
                  className={`w-full p-2 border ${
                    errors.tiempo_entrega_hasta
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green`}
                  placeholder="Hasta"
                  value={formData.tiempo_entrega_hasta}
                  onChange={(e) =>
                    handleTiempoEntregaChange(e, "tiempo_entrega_hasta")
                  }
                  maxLength={3}
                  inputMode="numeric"
                />
              </div>
              {(errors.tiempo_entrega_desde || errors.tiempo_entrega_hasta) && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.tiempo_entrega_desde || errors.tiempo_entrega_hasta}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <button
                  type="button"
                  className="text-sm text-nutri-green hover:text-green-700 flex items-center"
                  onClick={() => setIsTipoModalOpen(true)}
                >
                  <Plus size={16} className="mr-1" /> Nuevo Tipo
                </button>
              </div>
              <SearchableCombobox
                options={tipoProductoOptions}
                value={formData.tipo}
                onChange={(value) =>
                  handleInputChange({
                    target: { name: "tipo", value },
                  } as React.ChangeEvent<HTMLSelectElement>)
                }
                placeholder="Seleccionar tipo"
                searchPlaceholder="Buscar tipo..."
                emptyMessage="No se encontraron tipos."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor <span className="text-red-500">*</span>
              </label>
              <SearchableCombobox
                options={proveedorOptions}
                value={formData.proveedor_id}
                onChange={(value) =>
                  handleInputChange({
                    target: { name: "proveedor_id", value },
                  } as React.ChangeEvent<HTMLSelectElement>)
                }
                placeholder="Seleccionar proveedor"
                searchPlaceholder="Buscar proveedor..."
                emptyMessage="No se encontraron proveedores."
              />
              {errors.proveedor_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.proveedor_id}
                </p>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal para agregar nuevo tipo de producto */}
      <Modal
        isOpen={isTipoModalOpen}
        onClose={() => setIsTipoModalOpen(false)}
        title="Agregar Nuevo Tipo de Producto"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsTipoModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAgregarTipo}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Tipo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
              placeholder="Ej: Granos, Legumbres, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={descripcionTipo}
              onChange={(e) => setDescripcionTipo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
              placeholder="Descripción del tipo de producto"
              rows={3}
            />
          </div>
        </div>
      </Modal>

      {/* Modal para gestionar tipos de producto */}
      <Modal
        isOpen={isManageTiposModalOpen}
        onClose={() => setIsManageTiposModalOpen(false)}
        title="Gestionar Tipos de Producto"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsManageTiposModalOpen(false)}
            >
              Cerrar
            </Button>
          </>
        }
      >
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Agregar Nuevo Tipo</h3>
          <div className="flex space-x-2 mb-6">
            <input
              type="text"
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
              placeholder="Nombre del tipo de producto"
            />
            <Button onClick={handleAgregarTipo}>Agregar</Button>
          </div>

          <h3 className="text-lg font-medium mb-4">Lista de Tipos</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tiposProducto.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay tipos de producto registrados
              </p>
            ) : (
              tiposProducto.map((tipo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{tipo}</p>
                  </div>
                  <Button
                    onClick={() => handleEliminarTipo(tipo)}
                    variant="destructive"
                    size="sm"
                  >
                    Eliminar
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Modal de confirmación de eliminación */}
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
        <p>¿Estás seguro de que quieres eliminar este producto?</p>
        <p>Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
};

export default Productos;
