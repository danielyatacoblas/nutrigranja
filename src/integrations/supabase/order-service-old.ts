import { supabase } from "./base-client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";

// Helper to create a new order
export const createPedido = async (pedidoData: {
  producto_id: string;
  proveedor_id: string;
  precio_total: number;
  cantidad: number;
}) => {
  console.log("Creating pedido with data:", pedidoData);

  try {
    if (!pedidoData.producto_id) throw new Error("producto_id is required");
    if (!pedidoData.proveedor_id) throw new Error("proveedor_id is required");
    if (!pedidoData.precio_total) throw new Error("precio_total is required");
    if (!pedidoData.cantidad || pedidoData.cantidad <= 0)
      throw new Error("La cantidad debe ser positiva");

    const result = await supabase.from("pedido").insert({
      producto_id: pedidoData.producto_id,
      proveedor_id: pedidoData.proveedor_id,
      precio_total: pedidoData.precio_total,
      cantidad: pedidoData.cantidad,
      estado: "pendiente",
    });

    console.log("Order creation result:", result);
    return result;
  } catch (error) {
    console.error("Error in createPedido:", error);
    throw error;
  }
};

// Helper to get all orders
export const getAllPedidos = () => {
  return supabase.from("pedido").select(`
      *,
      producto:producto_id (*),
      proveedor:proveedor_id (*)
    `);
};

// Helper to get orders by status
export const getPedidosByEstado = (estado: "pendiente" | "recibido") => {
  return supabase
    .from("pedido")
    .select(
      `
      *,
      producto:producto_id (*),
      proveedor:proveedor_id (*)
    `
    )
    .eq("estado", estado);
};

// Helper to update order date
export const updatePedidoFecha = (pedidoId: string, fechaPedido: string) => {
  return supabase
    .from("pedido")
    .update({ fecha_pedido: fechaPedido })
    .eq("id", pedidoId);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateOrderPdfOld = async (pedido: any, usuario: any) => {
  try {
    console.log("Generando PDF para pedido:", pedido.id);
    console.log("Datos de pedido:", JSON.stringify(pedido, null, 2));
    console.log("Datos de usuario:", usuario);

    if (!pedido || !pedido.id) {
      throw new Error("Datos de pedido inválidos o incompletos");
    }

    // Create new PDF
    const doc = new jsPDF({ format: "a6", unit: "mm" }); // Formato ticket pequeño

    // --- Encabezado tipo ticket ---
    doc.setFillColor(44, 99, 44);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 16, "F");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("NUTRIGRANJA S.R.L.", doc.internal.pageSize.getWidth() / 2, 8, {
      align: "center",
    });

    // Ticket grande
    doc.setFontSize(13);
    doc.setTextColor(44, 99, 44);
    doc.setFont("helvetica", "bold");
    doc.text(
      `TICKET: ${pedido.ticket || pedido.id.substring(0, 8)}`,
      doc.internal.pageSize.getWidth() / 2,
      22,
      { align: "center" }
    );

    // Info general
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    let y = 28;
    doc.text(
      `Fecha: ${new Date(pedido.fecha_pedido).toLocaleDateString()}`,
      8,
      y
    );
    y += 5;
    doc.text(`Proveedor: ${pedido.proveedor?.nombre || "N/A"}`, 8, y);
    y += 5;
    doc.text(
      `Atiende: ${usuario?.nombres || ""} ${usuario?.apellidos || ""}`,
      8,
      y
    );
    y += 7;

    // Tabla de productos
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Detalle:", 8, y);
    y += 3;
    doc.setFont("helvetica", "normal");
    const productos = Array.isArray(pedido.productos) ? pedido.productos : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productos.forEach((prod: any) => {
      doc.text(
        `${prod.nombre} x${prod.cantidad || 1}  S/.${
          prod.precio ? Number(prod.precio).toFixed(2) : "0.00"
        }`,
        8,
        y
      );
      y += 4;
    });
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: S/.${Number(pedido.precio_total).toFixed(2)}`, 8, y);
    y += 8;

    // --- QR con datos del pedido ---
    const qrData = `Ticket: ${pedido.ticket || pedido.id}\nProveedor: ${
      pedido.proveedor?.nombre || "N/A"
    }\nFecha: ${new Date(
      pedido.fecha_pedido
    ).toLocaleDateString()}\nTotal: S/.${Number(pedido.precio_total).toFixed(
      2
    )}`;
    const qrUrl = await QRCode.toDataURL(qrData, { width: 80, margin: 1 });
    doc.addImage(
      qrUrl,
      "PNG",
      doc.internal.pageSize.getWidth() / 2 - 18,
      y,
      36,
      36
    );
    y += 38;

    // Footer bonito
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Gracias por su compra en NutriGranja!",
      doc.internal.pageSize.getWidth() / 2,
      y,
      { align: "center" }
    );

    // Generate the PDF as Blob
    let pdfBlob;
    try {
      pdfBlob = doc.output("blob");
    } catch (blobError) {
      console.error("Error generando blob del PDF:", blobError);
      throw new Error(`Error generando blob del PDF: ${blobError.message}`);
    }

    const fileName = `pedido_${pedido.id}_${uuidv4()}.pdf`;
    console.log("Intentando subir PDF con nombre:", fileName);

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pedidos")
        .upload(fileName, pdfBlob, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        console.error("Error al subir PDF:", uploadError);
        throw uploadError;
      }

      console.log("PDF subido exitosamente:", uploadData);

      const { data: urlData } = await supabase.storage
        .from("pedidos")
        .getPublicUrl(fileName);

      if (!urlData || !urlData.publicUrl) {
        throw new Error("No se pudo obtener la URL del PDF");
      }

      const pdfUrl = urlData.publicUrl;
      console.log("URL del PDF:", pdfUrl);

      return { pdfBlob, pdfUrl };
    } catch (error) {
      console.error("Error uploading PDF:", error);
      throw new Error(
        `Error al subir PDF: ${error.message || "Error desconocido"}`
      );
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Helper to update order status
export const updatePedidoEstado = async (
  pedidoId: string,
  estado: string,
  pdfUrl?: string
): Promise<{ success: boolean }> => {
  console.log(
    `Updating order ${pedidoId} status to ${estado}, PDF URL: ${
      pdfUrl || "none"
    }`
  );

  // Validate estado - only accept "pendiente" or "recibido"
  if (estado !== "pendiente" && estado !== "recibido") {
    console.error(
      `Invalid estado: ${estado}. Only "pendiente" or "recibido" are valid.`
    );
    throw new Error(
      `Invalid estado: ${estado}. Only "pendiente" or "recibido" are valid.`
    );
  }

  try {
    // Prepare data for updating the order
    const updateData: { estado: string; pdf_url?: string } = { estado };

    if (pdfUrl) {
      updateData.pdf_url = pdfUrl;
    }

    // Update the order status and PDF URL
    const { error: orderUpdateError } = await supabase
      .from("pedido")
      .update(updateData)
      .eq("id", pedidoId);

    if (orderUpdateError) {
      console.error("Error updating order status:", orderUpdateError);
      throw orderUpdateError;
    }

    console.log(`Order ${pedidoId} status updated to ${estado} successfully`);

    return { success: true };
  } catch (error) {
    console.error("Error in updatePedidoEstado:", error);
    throw error;
  }
};

// Helper to update order PDF URL
export const updatePedidoPdfUrl = (pedidoId: string, pdfUrl: string) => {
  return supabase.from("pedido").update({ pdf_url: pdfUrl }).eq("id", pedidoId);
};

// Helper to delete an order
export const deletePedido = (pedidoId: string) => {
  return supabase.from("pedido").delete().eq("id", pedidoId);
};

// Helper to delete all notifications for user
export const deleteAllNotifications = async (userId: string) => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("notificaciones")
    .select("id, visto");

  if (error) throw error;

  // Update each notification with the user's ID in the visto object
  const updatePromises = data.map((notification) => {
    // Initialize a new object for visto data
    const vistoData = notification.visto
      ? JSON.parse(JSON.stringify(notification.visto))
      : {};
    vistoData[userId] = now;

    return supabase
      .from("notificaciones")
      .update({ visto: vistoData })
      .eq("id", notification.id);
  });

  return Promise.all(updatePromises);
};

// Helper to delete a specific notification
export const deleteNotification = async (
  notificationId: string,
  userId: string
) => {
  const { data, error } = await supabase
    .from("notificaciones")
    .select("visto")
    .eq("id", notificationId)
    .single();

  if (error) throw error;

  // Mark as deleted for this user
  const updatedVisto = data?.visto
    ? JSON.parse(JSON.stringify(data.visto))
    : {};
  updatedVisto[userId] = new Date().toISOString();

  return supabase
    .from("notificaciones")
    .update({ visto: updatedVisto })
    .eq("id", notificationId);
};
