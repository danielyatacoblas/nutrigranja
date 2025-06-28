import { supabase } from "./base-client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { v4 as uuidv4 } from "uuid";
import { HistorialItem } from "@/types/database";

// Define the ReportSettings type to match the one in ReportModal.tsx
export interface ReportSettings {
  chartType: "bar" | "pie" | "line";
  itemCount: number;
  reportTitle: string;
  includeTotals: boolean;
  includeDetails: boolean;
  reportType: "simple" | "detailed" | "combined";
  includeProducts?: boolean;
  includeOrders?: boolean;
  exportFormat: "pdf";
  timeRange: "month" | "quarter" | "year" | "all";
  highlightTopItems?: boolean;
}

// Generate and upload a PDF report for a history record
export async function generateHistoryReportPdf(
  historialItem: HistorialItem
): Promise<string | null> {
  try {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(44, 99, 44);
    doc.text("REPORTE DE ACTIVIDAD", 105, 15, { align: "center" });

    // Add logo/image if available
    // doc.addImage(...) - Uncomment if you have a logo

    // Add report info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    doc.setFont("helvetica", "bold");
    doc.text("Tipo:", 20, 30);
    doc.setFont("helvetica", "normal");
    doc.text(historialItem.tipo, 45, 30);

    doc.setFont("helvetica", "bold");
    doc.text("Módulo:", 20, 40);
    doc.setFont("helvetica", "normal");
    doc.text(historialItem.modulo, 45, 40);

    doc.setFont("helvetica", "bold");
    doc.text("Acción:", 20, 50);
    doc.setFont("helvetica", "normal");
    doc.text(
      historialItem.accion.charAt(0).toUpperCase() +
        historialItem.accion.slice(1),
      45,
      50
    );

    doc.setFont("helvetica", "bold");
    doc.text("Usuario:", 20, 60);
    doc.setFont("helvetica", "normal");
    doc.text(historialItem.usuario, 45, 60);

    doc.setFont("helvetica", "bold");
    doc.text("Fecha:", 20, 70);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(historialItem.fecha).toLocaleString(), 45, 70);

    doc.setFont("helvetica", "bold");
    doc.text("Descripción:", 20, 80);
    doc.setFont("helvetica", "normal");

    // Handle multiline description
    const splitDescription = doc.splitTextToSize(
      historialItem.descripcion,
      170
    );
    doc.text(splitDescription, 20, 90);

    // Add details table if there's data
    if (historialItem.datos) {
      const startY = 90 + splitDescription.length * 7;

      doc.setFont("helvetica", "bold");
      doc.text("Detalles:", 20, startY);

      const tableData = Object.entries(historialItem.datos).map(
        ([key, value]) => {
          const formattedKey =
            key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
          const formattedValue =
            typeof value === "object" ? JSON.stringify(value) : String(value);
          return [formattedKey, formattedValue];
        }
      );

      autoTable(doc, {
        startY: startY + 10,
        head: [["Campo", "Valor"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [44, 99, 44], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
      });
    }

    // Add footer with date and page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Reporte generado el ${new Date().toLocaleString()}`,
        20,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10,
        { align: "right" }
      );
    }

    // Generate filename based on historial ID
    const filename = `reporte-${historialItem.tipo.toLowerCase()}-${historialItem.id.substring(
      0,
      8
    )}.pdf`;
    const pdfBlob = doc.output("blob");

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("reportes")
      .upload(`historial/${filename}`, pdfBlob, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading PDF to storage:", error);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("reportes")
      .getPublicUrl(`historial/${filename}`);

    // IMPORTANT: Save the PDF URL back to the historial record
    const { error: updateError } = await supabase
      .from("historial")
      .update({ pdf_url: urlData.publicUrl })
      .eq("id", historialItem.id);

    if (updateError) {
      console.error("Error updating historial with PDF URL:", updateError);
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
}

// Generate a dashboard report for Ranking or Dashboard pages
export async function generateDashboardReport(
  title: string,
  subtitle: string,
  chartType: string,
  data: any[],
  filters: Record<string, string>
): Promise<string | null> {
  try {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(44, 99, 44);
    doc.text(`REPORTE: ${title}`, 105, 15, { align: "center" });

    // Add subtitle
    doc.setFontSize(14);
    doc.text(subtitle, 105, 25, { align: "center" });

    // Add filters section if present
    if (filters && Object.keys(filters).length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Filtros aplicados:", 20, 40);

      let yPosition = 50;
      Object.entries(filters).forEach(([key, value]) => {
        const formattedKey =
          key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
        doc.setFont("helvetica", "bold");
        doc.text(`${formattedKey}:`, 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(String(value), 70, yPosition);
        yPosition += 10;
      });

      // Adjust starting position based on filters
      yPosition += 10;
    } else {
      var yPosition = 40;
    }

    // Add data table
    if (data.length > 0) {
      const headers = Object.keys(data[0]).map(
        (key) => key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")
      );

      const rows = data.map((item) =>
        Object.values(item).map((value) =>
          typeof value === "object" ? JSON.stringify(value) : String(value)
        )
      );

      autoTable(doc, {
        startY: yPosition,
        head: [headers],
        body: rows,
        theme: "grid",
        headStyles: { fillColor: [44, 99, 44], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
      });
    }

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Reporte generado el ${new Date().toLocaleString()}`,
        20,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10,
        { align: "right" }
      );
    }

    // Generate a unique filename
    const uniqueId = uuidv4().substring(0, 8);
    const filename = `reporte-${title
      .toLowerCase()
      .replace(/\s+/g, "-")}-${uniqueId}.pdf`;
    const pdfBlob = doc.output("blob");

    // Upload to Supabase Storage
    const { data: uploadData, error } = await supabase.storage
      .from("reportes")
      .upload(`dashboard/${filename}`, pdfBlob, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading PDF to storage:", error);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("reportes")
      .getPublicUrl(`dashboard/${filename}`);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error generating dashboard report:", error);
    return null;
  }
}

export async function generateRankingReport(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  proveedores: any[],
  settings: ReportSettings
): Promise<string | null> {
  try {
    // Sort providers by rating
    const sortedProveedores = [...proveedores]
      .sort((a, b) => (b.calificacion || 0) - (a.calificacion || 0))
      .slice(0, settings.itemCount);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const relacionados = {} as any;

    if (settings.reportType === "combined") {
      // Si se requieren productos
      if (settings.includeProducts) {
        const { data: productos } = await supabase
          .from("producto")
          .select("*")
          .in(
            "proveedor_id",
            sortedProveedores.map((p) => p.id)
          );

        relacionados.productos = productos || [];
      }

      // Si se requieren pedidos
      if (settings.includeOrders) {
        const { data: pedidos } = await supabase
          .from("pedido")
          .select("*")
          .in(
            "proveedor_id",
            sortedProveedores.map((p) => p.id)
          );

        relacionados.pedidos = pedidos || [];
      }
    }

    const doc = new jsPDF();

    // Añadir encabezado
    doc.setFontSize(20);
    doc.setTextColor(44, 99, 44);
    doc.text(`REPORTE: ${settings.reportTitle}`, 105, 15, { align: "center" });

    // Añadir subtítulo
    doc.setFontSize(14);
    doc.text(
      `Top ${settings.itemCount} Proveedores por Calificación`,
      105,
      25,
      { align: "center" }
    );

    // Añadir fecha y periodo
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let periodoTexto;
    switch (settings.timeRange) {
      case "month":
        periodoTexto = "Último mes";
        break;
      case "quarter":
        periodoTexto = "Último trimestre";
        break;
      case "year":
        periodoTexto = "Último año";
        break;
      default:
        periodoTexto = "Todos los tiempos";
    }
    doc.text(`Periodo: ${periodoTexto}`, 105, 32, { align: "center" });

    // Añadir tabla de proveedores principales
    let yPosition = 40;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Proveedores Destacados", 20, yPosition);
    yPosition += 10;

    // Datos para la tabla de proveedores
    if (sortedProveedores.length > 0) {
      // Determinamos las columnas relevantes
      let headers, rows;

      if (settings.reportType === "simple") {
        // Solo datos básicos
        headers = ["Nombre", "Calificación", "Tipo"];
        rows = sortedProveedores.map((p) => [
          p.nombre || "Sin nombre",
          (p.calificacion || 0).toFixed(1),
          p.tipo || "N/A",
        ]);
      } else {
        // Datos más detallados
        headers = [
          "Nombre",
          "Calificación",
          "Tipo",
          "% Pedidos",
          "Total Pedidos",
          "Último Pedido",
        ];
        rows = sortedProveedores.map((p) => [
          p.nombre || "Sin nombre",
          (p.calificacion || 0).toFixed(1),
          p.tipo || "N/A",
          `${p.porcentajePedidos || 0}%`,
          p.pedidosTotales || 0,
          p.ultimoPedido
            ? new Date(p.ultimoPedido).toLocaleDateString()
            : "N/A",
        ]);
      }

      autoTable(doc, {
        startY: yPosition,
        head: [headers],
        body: rows,
        theme: "grid",
        headStyles: { fillColor: [44, 99, 44], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
        didDrawPage: (data) => {
          yPosition = data.cursor.y + 15;
        },
      });
    }

    // Si es un reporte combinado, agregar tablas adicionales
    if (settings.reportType === "combined") {
      // Si se incluyen productos
      if (settings.includeProducts && relacionados.productos?.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("Productos de los Proveedores", 20, yPosition);
        yPosition += 10;

        const productosHeaders = ["Nombre", "Tipo", "Proveedor"];
        const productosRows = relacionados.productos.map((p: any) => {
          const proveedor = sortedProveedores.find(
            (prov) => prov.id === p.proveedor_id
          );
          return [
            p.nombre || "Sin nombre",
            p.tipo || "N/A",
            proveedor?.nombre || "Desconocido",
          ];
        });

        // Highlight top products if requested
        if (settings.highlightTopItems) {
          autoTable(doc, {
            startY: yPosition,
            head: [productosHeaders],
            body: productosRows,
            theme: "grid",
            headStyles: { fillColor: [44, 99, 44], textColor: [255, 255, 255] },
            styles: { fontSize: 10 },
            didDrawPage: (data) => {
              yPosition = data.cursor.y + 15;
            },
            willDrawCell: (data) => {
              // Highlight first 3 rows
              if (data.row.index < 3 && data.row.index >= 0) {
                data.cell.styles.fillColor = [240, 248, 240];
              }
            },
          });
        } else {
          autoTable(doc, {
            startY: yPosition,
            head: [productosHeaders],
            body: productosRows,
            theme: "grid",
            headStyles: { fillColor: [44, 99, 44], textColor: [255, 255, 255] },
            styles: { fontSize: 10 },
            didDrawPage: (data) => {
              yPosition = data.cursor.y + 15;
            },
          });
        }
      }

      // Si se incluyen pedidos
      if (settings.includeOrders && relacionados.pedidos?.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("Pedidos Recientes", 20, yPosition);
        yPosition += 10;

        const pedidosHeaders = [
          "Fecha",
          "Proveedor",
          "Cantidad",
          "Total",
          "Estado",
        ];
        const pedidosRows = relacionados.pedidos
          .sort(
            (a: any, b: any) =>
              new Date(b.fecha_pedido).getTime() -
              new Date(a.fecha_pedido).getTime()
          )
          .slice(0, 10) // Mostrar solo los 10 más recientes
          .map((p: any) => {
            const proveedor = sortedProveedores.find(
              (prov) => prov.id === p.proveedor_id
            );
            return [
              new Date(p.fecha_pedido).toLocaleDateString(),
              proveedor?.nombre || "Desconocido",
              p.cantidad || 0,
              p.precio_total ? `$${p.precio_total}` : "N/A",
              p.estado?.charAt(0).toUpperCase() + p.estado?.slice(1) || "N/A",
            ];
          });

        autoTable(doc, {
          startY: yPosition,
          head: [pedidosHeaders],
          body: pedidosRows,
          theme: "grid",
          headStyles: { fillColor: [44, 99, 44], textColor: [255, 255, 255] },
          styles: { fontSize: 10 },
          didDrawPage: (data) => {
            yPosition = data.cursor.y + 15;
          },
        });
      }
    }

    // Si se incluyen totales
    if (settings.includeTotals) {
      // Añadir sección de resumen con totales
      doc.setFont("helvetica", "bold");
      doc.text("Resumen General", 20, yPosition);
      yPosition += 10;

      const totalProveedores = proveedores.length;
      const promedioCalificacion =
        proveedores.reduce((sum, p) => sum + (p.calificacion || 0), 0) /
        (proveedores.filter((p) => p.calificacion !== null).length || 1);

      // Crear tabla de resumen
      const resumenHeaders = ["Métrica", "Valor"];
      const resumenRows = [
        ["Total de Proveedores", totalProveedores.toString()],
        ["Calificación Promedio", promedioCalificacion.toFixed(2)],
        ["Proveedores Destacados", settings.itemCount.toString()],
      ];

      if (settings.reportType === "combined") {
        if (settings.includeProducts) {
          resumenRows.push([
            "Total de Productos",
            relacionados.productos?.length.toString() || "0",
          ]);
        }
        if (settings.includeOrders) {
          resumenRows.push([
            "Total de Pedidos",
            relacionados.pedidos?.length.toString() || "0",
          ]);
        }
      }

      autoTable(doc, {
        startY: yPosition,
        head: [resumenHeaders],
        body: resumenRows,
        theme: "grid",
        headStyles: { fillColor: [44, 99, 44], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
      });
    }

    // Añadir pie de página con fecha y numeración
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Reporte generado el ${new Date().toLocaleString()}`,
        20,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10,
        { align: "right" }
      );
    }

    // Generar nombre de archivo único
    const uniqueId = uuidv4().substring(0, 8);
    const filename = `ranking-${settings.reportTitle
      .toLowerCase()
      .replace(/\s+/g, "-")}-${uniqueId}.pdf`;
    const pdfBlob = doc.output("blob");

    // Subir a Supabase Storage
    const { data: uploadData, error } = await supabase.storage
      .from("reportes")
      .upload(`ranking/${filename}`, pdfBlob, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading PDF to storage:", error);
      return null;
    }

    // Obtener la URL pública
    const { data: urlData } = supabase.storage
      .from("reportes")
      .getPublicUrl(`ranking/${filename}`);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error generating ranking report:", error);
    return null;
  }
}
