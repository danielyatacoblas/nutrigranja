
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Convert array to CSV string
export const convertToCSV = (objArray: any[]) => {
  if (objArray.length === 0) return '';
  
  const fields = Object.keys(objArray[0]);
  let csv = fields.join(',') + '\n';
  
  objArray.forEach(item => {
    const values = fields.map(field => {
      const value = item[field];
      // Handle strings with commas by wrapping in quotes
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value !== null && value !== undefined ? value : '';
    });
    csv += values.join(',') + '\n';
  });
  
  return csv;
};

// Export data as CSV file
export const exportToCSV = (data: any[], fileName: string) => {
  const csvData = convertToCSV(data);
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export data as Excel file
export const exportToExcel = (data: any[], fileName: string) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  // Generate the Excel file
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// Export data as PDF
export const exportToPDF = (
  data: any[], 
  fileName: string, 
  title: string = 'Report',
  columns: Array<{ header: string; dataKey: string }> = []
) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Set up the table
  const columnsToUse = columns.length > 0 ? columns : 
    Object.keys(data[0] || {}).map(key => ({ header: key, dataKey: key }));
  
  autoTable(doc, {
    startY: 35,
    head: [columnsToUse.map(col => col.header)],
    body: data.map(item => columnsToUse.map(col => {
      const value = item[col.dataKey];
      return value !== null && value !== undefined ? value : '';
    })),
    theme: 'striped',
    headStyles: { 
      fillColor: [46, 125, 50], // #2E7D32
      textColor: 255 
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    }
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  doc.save(`${fileName}.pdf`);
};

// Function to format product data for export
export const formatProductosForExport = (productos: any[]) => {
  return productos.map(producto => ({
    'Nombre': producto.nombre || '',
    'Tipo': producto.tipo || 'No asignado',
    'Proveedor': producto.proveedor?.nombre || 'Sin proveedor',
    'Peso/Unidad': `${producto.peso} (${producto.unit_of_measure || 'UNIDAD'})`,
    'Tiempo de Entrega': producto.tiempo_entrega_desde && producto.tiempo_entrega_hasta ? 
      `${producto.tiempo_entrega_desde}-${producto.tiempo_entrega_hasta} días` : 
      'No especificado',
    'Stock': producto.stock || 0,
    'Alerta Stock': producto.stock_alert || 0,
    'Estado': getProductStockStatus(producto.stock, producto.stock_alert),
    'Precio': producto.precio ? `$${producto.precio.toFixed(2)}` : '$0.00',
    'Referencia': producto.referencia || 'N/A',
    'Fecha Creación': producto.created_at ? new Date(producto.created_at).toLocaleDateString() : 'N/A'
  }));
};

// Helper function to get product stock status
function getProductStockStatus(stock: number, stockAlert: number): string {
  if (stock <= 0) {
    return 'Sin stock';
  } else if (stock <= stockAlert) {
    return 'Por acabarse';
  } else {
    return 'Estable';
  }
}

// Function to format pedidos data for export
export const formatPedidosForExport = (pedidos: any[]) => {
  return pedidos.map(pedido => ({
    'Producto': pedido.producto?.nombre || 'N/A',
    'Proveedor': pedido.proveedor?.nombre || 'N/A',
    'Cantidad': pedido.cantidad || 0,
    'Precio Total': pedido.precio_total ? `$${pedido.precio_total.toFixed(2)}` : '$0.00',
    'Estado': pedido.estado === 'pendiente' ? 'Pendiente' : 'Recibido',
    'Fecha Pedido': new Date(pedido.fecha_pedido).toLocaleDateString(),
  }));
};

// Format proveedores data for export with detailed information
export const formatProveedoresForExport = (
  proveedores: any[], 
  options = { 
    includeProducts: false, 
    includeRatings: false, 
    includeContactInfo: true, 
    includeOrderHistory: false 
  }
) => {
  return proveedores.map(proveedor => {
    const baseInfo = {
      'Nombre': proveedor.nombre || '',
      'Tipo': proveedor.tipo || 'No asignado',
      'Calificación': proveedor.calificacion ? `${proveedor.calificacion}/5` : 'Sin calificar',
      'País': proveedor.pais || 'Perú',
      'Tipo Documento': proveedor.tipo_documento || 'RUC',
      'Número Documento': proveedor.numero_documento || 'No registrado',
      'Fecha Registro': proveedor.created_at ? new Date(proveedor.created_at).toLocaleDateString() : 'N/A'
    };
    
    // Add contact information if requested
    if (options.includeContactInfo) {
      return {
        ...baseInfo,
        'Dirección': proveedor.direccion || 'No registrada',
        'Teléfono': proveedor.telefono || 'No registrado',
        'Correo': proveedor.correo || 'No registrado',
      };
    }
    
    return baseInfo;
  });
};

// Format users data for export
export const formatUsuariosForExport = (usuarios: any[]) => {
  return usuarios.map(usuario => ({
    'Usuario': usuario.usuario || '',
    'Nombres': usuario.nombres || '',
    'Apellidos': usuario.apellidos || '',
    'Correo': usuario.correo || '',
    'Rol': usuario.rol || 'usuario',
    'Estado': usuario.estado || 'inactivo',
    'Fecha Registro': usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString() : 'N/A',
    'DNI': usuario.dni || 'No registrado',
    'Teléfono': usuario.telefono || 'No registrado',
  }));
};
