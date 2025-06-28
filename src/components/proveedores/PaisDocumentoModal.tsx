
import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash, Edit, Search } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaisDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaisDocumento {
  id: string;
  pais: string;
  codigo: string;
  tipo_documento: string;
  formato: string;
  descripcion?: string;
}

const PaisDocumentoModal: React.FC<PaisDocumentoModalProps> = ({ isOpen, onClose }) => {
  const [paisesDocumentos, setPaisesDocumentos] = useState<PaisDocumento[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<PaisDocumento | null>(null);
  const [formData, setFormData] = useState({
    pais: '',
    codigo: '',
    tipo_documento: '',
    limite_digitos: '',
    descripcion: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    if (isOpen) {
      fetchPaisesDocumentos();
    }
  }, [isOpen]);
  
  // Resetear la página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchPaisesDocumentos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pais_documentos')
        .select('*')
        .order('pais', { ascending: true })
        .order('tipo_documento', { ascending: true });

      if (error) {
        throw error;
      }

      setPaisesDocumentos(data || []);
    } catch (error: any) {
      toast.error('Error al cargar países y documentos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar registros por término de búsqueda
  const filteredItems = paisesDocumentos.filter(item => 
    item.pais.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.tipo_documento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.pais.trim()) {
      newErrors.pais = 'El país es requerido';
    }

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código del país es requerido';
    }

    if (!formData.tipo_documento.trim()) {
      newErrors.tipo_documento = 'El tipo de documento es requerido';
    }

    if (!formData.limite_digitos.trim()) {
      newErrors.limite_digitos = 'El límite de dígitos es requerido';
    } else if (!/^\d+$/.test(formData.limite_digitos)) {
      newErrors.limite_digitos = 'Ingrese solo números';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Para el campo límite_digitos, solo permitir números
    if (name === 'limite_digitos' && value && !/^\d*$/.test(value)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo específico
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Crear el formato de expresión regular basado en el límite de dígitos
      const formato = `^[0-9]{${formData.limite_digitos}}$`;
      
      if (editMode && currentItem) {
        const { error } = await supabase
          .from('pais_documentos')
          .update({
            pais: formData.pais,
            codigo: formData.codigo,
            tipo_documento: formData.tipo_documento,
            formato: formato,
            descripcion: formData.descripcion || null
          })
          .eq('id', currentItem.id);

        if (error) throw error;
        toast.success('Registro actualizado correctamente');
      } else {
        const { error } = await supabase
          .from('pais_documentos')
          .insert([{
            pais: formData.pais,
            codigo: formData.codigo,
            tipo_documento: formData.tipo_documento,
            formato: formato,
            descripcion: formData.descripcion || null
          }]);

        if (error) throw error;
        toast.success('Registro agregado correctamente');
      }
      
      resetForm();
      fetchPaisesDocumentos();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el registro');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: PaisDocumento) => {
    // Extraer el límite de dígitos del formato
    const digitMatch = item.formato.match(/\{(\d+)\}/);
    const limiteDigitos = digitMatch ? digitMatch[1] : '';
    
    setFormData({
      pais: item.pais,
      codigo: item.codigo,
      tipo_documento: item.tipo_documento,
      limite_digitos: limiteDigitos,
      descripcion: item.descripcion || ''
    });
    setCurrentItem(item);
    setEditMode(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro que desea eliminar este registro? Esta acción no se puede deshacer.')) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('pais_documentos')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Registro eliminado correctamente');
        fetchPaisesDocumentos();
        
        // Verificar si después de eliminar hay que ajustar la página actual
        if (currentItems.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error: any) {
        toast.error(error.message || 'Error al eliminar el registro');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      pais: '',
      codigo: '',
      tipo_documento: '',
      limite_digitos: '',
      descripcion: ''
    });
    setErrors({});
    setEditMode(false);
    setCurrentItem(null);
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
        pages.push('ellipsis');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 1) {
        pages.push('ellipsis');
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
      title="Gestión de Países y Tipos de Documento"
      footer={
        <div className="w-full flex justify-between">
          <Button 
            variant="outline" 
            onClick={resetForm}
            disabled={!editMode}
          >
            Cancelar Edición
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="border p-4 rounded-md bg-gray-50">
          <h3 className="text-lg font-medium mb-4">{editMode ? 'Editar' : 'Agregar'} País y Tipo de Documento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País*
              </label>
              <Input
                name="pais"
                value={formData.pais}
                onChange={handleInputChange}
                className={errors.pais ? 'border-red-500' : ''}
                placeholder="Ej: Perú"
              />
              {errors.pais && <p className="text-red-500 text-xs mt-1">{errors.pais}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de País*
              </label>
              <Input
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                className={errors.codigo ? 'border-red-500' : ''}
                placeholder="Ej: PE"
              />
              {errors.codigo && <p className="text-red-500 text-xs mt-1">{errors.codigo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento*
              </label>
              <Input
                name="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleInputChange}
                className={errors.tipo_documento ? 'border-red-500' : ''}
                placeholder="Ej: DNI, RUC, etc."
              />
              {errors.tipo_documento && <p className="text-red-500 text-xs mt-1">{errors.tipo_documento}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Límite de Dígitos*
              </label>
              <Input
                name="limite_digitos"
                value={formData.limite_digitos}
                onChange={handleInputChange}
                inputMode="numeric"
                className={errors.limite_digitos ? 'border-red-500' : ''}
                placeholder="Ej: 8"
              />
              {errors.limite_digitos && <p className="text-red-500 text-xs mt-1">{errors.limite_digitos}</p>}
              <p className="text-xs text-gray-500 mt-1">Ingrese solo el número de dígitos (Ej: 8 para DNI, 11 para RUC)</p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <Input
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción adicional (opcional)"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Guardando...' : editMode ? 'Actualizar' : 'Agregar'}
            </Button>
          </div>
        </form>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Países y Tipos de Documento Registrados</h3>
          
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por país o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2"
            />
          </div>
          
          {loading && !paisesDocumentos.length ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>País</TableHead>
                    <TableHead>Tipo de Documento</TableHead>
                    <TableHead>Límite de Dígitos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        {searchTerm ? 'No se encontraron resultados' : 'No hay registros'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map(item => {
                      // Extraer el límite de dígitos del formato
                      const digitMatch = item.formato.match(/\{(\d+)\}/);
                      const limiteDigitos = digitMatch ? digitMatch[1] : '-';
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.pais}</TableCell>
                          <TableCell>{item.tipo_documento}</TableCell>
                          <TableCell>{limiteDigitos}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEdit(item)} 
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                              >
                                <Edit size={18} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(item.id)} 
                                className="text-red-600 hover:text-red-800 hover:bg-red-100"
                              >
                                <Trash size={18} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
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
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((page, index) => 
                    page === 'ellipsis' ? (
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
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-500">
            Mostrando {Math.min(startIndex + 1, filteredItems.length)} a {Math.min(endIndex, filteredItems.length)} de {filteredItems.length} {filteredItems.length === 1 ? 'registro' : 'registros'}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PaisDocumentoModal;
