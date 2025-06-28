import React from "react";
import {
  Search,
  File,
  ChevronDown,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import SearchInput from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import PedidosAdvancedFilter, {
  PedidosAdvancedFilters,
} from "./PedidosAdvancedFilter";

interface PedidosFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  proveedorFilter: string;
  onProveedorFilterChange: (value: string) => void;
  proveedores: { id: string; nombre: string }[];
  productos: { id: string; nombre: string }[];
  rowsPerPage: number;
  activeTab: "pendientes" | "recibidos";
  onTabChange: (tab: "pendientes" | "recibidos") => void;
  onOpenFilterModal: () => void;
  onOpenExportModal: () => void;
  onQuickExport: (format: "csv" | "excel" | "pdf") => void;
  advancedFilters: PedidosAdvancedFilters;
  onAdvancedFiltersChange: (filters: PedidosAdvancedFilters) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
}

const PedidosFilter: React.FC<PedidosFilterProps> = ({
  searchTerm,
  onSearchChange,
  proveedores,
  productos,
  rowsPerPage,
  activeTab,
  onTabChange,
  onOpenFilterModal,
  onOpenExportModal,
  onQuickExport,
  advancedFilters,
  onAdvancedFiltersChange,
  showAdvancedFilters,
  setShowAdvancedFilters,
}) => {
  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="w-full md:max-w-md">
          <div className="relative">
            <SearchInput
              placeholder="Buscar por producto o proveedor..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white border-primary/40 hover:border-primary text-primary flex items-center gap-2 ml-2"
                >
                  <File size={16} className="text-primary" />
                  Exportar
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => onQuickExport("csv")}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <FileText size={16} /> Exportar como CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onQuickExport("excel")}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <FileSpreadsheet size={16} /> Exportar como Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onQuickExport("pdf")}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <File size={16} /> Exportar como PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onOpenExportModal}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <File size={16} /> Exportación avanzada
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Filtros avanzados */}
      <div className="mb-6">
        <PedidosAdvancedFilter
          filters={advancedFilters}
          onFiltersChange={onAdvancedFiltersChange}
          productos={productos}
          proveedores={proveedores}
          showFilters={showAdvancedFilters}
          setShowFilters={setShowAdvancedFilters}
        />
      </div>

      <div className="mb-4">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "pendientes"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => onTabChange("pendientes")}
          >
            Pedidos por Confirmar
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "recibidos"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => onTabChange("recibidos")}
          >
            Pedidos Recibidos
          </button>
        </div>
      </div>
    </>
  );
};

export default PedidosFilter;
