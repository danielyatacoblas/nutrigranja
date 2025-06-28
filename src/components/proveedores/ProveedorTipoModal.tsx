import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { supabase } from "@/integrations/supabase/client";
import { ProveedorTipo, anyFrom } from "@/types/database";
import { toast } from "sonner";
import {
  Tractor,
  Shrub,
  Wheat,
  WheatOff,
  TreeDeciduous,
  TreePalm,
  TreePine,
  Carrot,
  Egg,
  EggOff,
  Sprout,
  Leaf,
  Flower2,
  Apple,
  Banana,
  Cherry,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ICON_OPTIONS = [
  { name: "tractor", icon: Tractor },
  { name: "shrub", icon: Shrub },
  { name: "wheat", icon: Wheat },
  { name: "wheat-off", icon: WheatOff },
  { name: "tree-deciduous", icon: TreeDeciduous },
  { name: "tree-palm", icon: TreePalm },
  { name: "tree-pine", icon: TreePine },
  { name: "carrot", icon: Carrot },
  { name: "egg", icon: Egg },
  { name: "egg-off", icon: EggOff },
  { name: "sprout", icon: Sprout },
  { name: "leaf", icon: Leaf },
  { name: "flower", icon: Flower2 },
  { name: "apple", icon: Apple },
  { name: "banana", icon: Banana },
  { name: "cherry", icon: Cherry },
];

interface ProveedorTipoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  proveedorTipos: ProveedorTipo[];
}

const ProveedorTipoModal: React.FC<ProveedorTipoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  proveedorTipos,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    icono: "tractor",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Filtrar tipos por término de búsqueda
  const filteredTipos = proveedorTipos.filter((tipo) =>
    tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredTipos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTipos = filteredTipos.slice(startIndex, endIndex);

  // Resetear la página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleIconSelect = (iconName: string) => {
    setFormData((prev) => ({
      ...prev,
      icono: iconName,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await anyFrom<any>(supabase, "proveedor_tipo").insert([
        formData,
      ]);

      if (error) throw error;
      toast.success("Tipo de proveedor agregado correctamente");

      setFormData({
        nombre: "",
        icono: "tractor",
      });

      onSave();
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Error al guardar el tipo de proveedor");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await anyFrom<any>(supabase, "proveedor_tipo")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Tipo de proveedor eliminado correctamente");
      onSave();

      // Verificar si después de eliminar hay que ajustar la página actual
      if (currentTipos.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Error al eliminar el tipo de proveedor");
    }
  };

  const renderIcon = (iconName: string) => {
    const IconComponent =
      ICON_OPTIONS.find((icon) => icon.name === iconName)?.icon || Tractor;
    return <IconComponent size={20} />;
  };

  // Generar números de página para paginación
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 2) {
        pages.push("ellipsis");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 1) {
        pages.push("ellipsis");
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestionar Tipos de Proveedor"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </>
      }
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Agregar Nuevo Tipo</h3>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre*
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={`w-full p-2 border ${
                errors.nombre ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green`}
              placeholder="Ingrese nombre del tipo de proveedor"
            />
            {errors.nombre && (
              <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icono
            </label>
            <Select value={formData.icono} onValueChange={handleIconSelect}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Seleccione un icono" />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((icon) => (
                  <SelectItem
                    key={icon.name}
                    value={icon.name}
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <icon.icon size={18} />
                      <span>
                        {icon.name.charAt(0).toUpperCase() +
                          icon.name.slice(1).replace("-", " ")}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-4 gap-2 mt-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => handleIconSelect(icon.name)}
                  className={`p-2 border rounded-md ${
                    formData.icono === icon.name
                      ? "border-nutri-green bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <icon.icon size={24} />
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Agregar Tipo
          </Button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Lista de Tipos</h3>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <Input
            type="text"
            placeholder="Buscar tipos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {currentTipos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              {searchTerm
                ? "No se encontraron resultados"
                : "No hay tipos de proveedor registrados"}
            </p>
          ) : (
            currentTipos.map((tipo) => (
              <div
                key={tipo.id}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-gray-600">
                    {renderIcon(tipo.icono || "tractor")}
                  </div>
                  <div>
                    <p className="font-medium">{tipo.nombre}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleDelete(tipo.id)}
                  variant="danger"
                  size="sm"
                >
                  Eliminar
                </Button>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) =>
                  page === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={`page-${page}`}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page as number);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        setCurrentPage(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          Mostrando {Math.min(startIndex + 1, filteredTipos.length)} a{" "}
          {Math.min(endIndex, filteredTipos.length)} de {filteredTipos.length}{" "}
          {filteredTipos.length === 1 ? "tipo" : "tipos"}
        </div>
      </div>
    </Modal>
  );
};

export default ProveedorTipoModal;
