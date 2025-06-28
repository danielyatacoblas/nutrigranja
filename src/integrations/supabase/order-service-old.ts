import { supabase } from "./base-client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { v4 as uuidv4 } from "uuid";

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
    const doc = new jsPDF();

    try {
      // Company info header - Simplified without logo
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("ORDEN DE COMPRA", 14, 15);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("RUC: 2072814901", 14, 22);
      doc.text("NutriGranja S.R.L.", 14, 27);
      doc.text("Gerente: Alder Flores Nick", 14, 32);
      doc.text(
        `Empleado: ${usuario?.nombres || ""} ${usuario?.apellidos || ""}`,
        14,
        37
      );

      // Order details
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Confirmación de pedido", 14, 55);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const today = new Date();
      doc.text(`Orden N°: ${pedido.id.substring(0, 6)}`, 14, 62);
      doc.text(`Fecha del pedido: ${today.toLocaleDateString()}`, 14, 67);
      doc.text(`Proveedor: ${pedido.proveedor?.nombre || "N/A"}`, 14, 72);
      doc.text("Método de pago: Contra entrega", 14, 77);

      // Making sure producto nombre is safely accessed
      const productoNombre = pedido.producto?.nombre || "N/A";
      // Use a short version of the product ID as the identifier
      const productoId = pedido.producto_id
        ? pedido.producto_id.substring(0, 6)
        : "N/A";

      console.log("Producto nombre:", productoNombre);
      console.log("ID de producto:", productoId);

      // Order table
      autoTable(doc, {
        startY: 85,
        head: [["ID", "Artículo", "Cantidad", "Precio", "Total"]],
        body: [
          [
            productoId,
            productoNombre,
            pedido.cantidad.toString(),
            `$${(pedido.precio_total / pedido.cantidad).toFixed(2)}`,
            `$${pedido.precio_total.toFixed(2)}`,
          ],
        ],
        foot: [
          ["", "", "", "SUBTOTAL:", `$${pedido.precio_total.toFixed(2)}`],
          [
            "",
            "",
            "",
            "TOTAL SOLES:",
            `S/.${(pedido.precio_total * 3.7).toFixed(2)}`,
          ],
        ],
        theme: "striped",
      });

      // Get the last table's Y position
      const finalY = (doc as any).lastAutoTable?.finalY || 120;

      // Footer notes
      doc.setFontSize(9);
      doc.text(
        "Por favor, entregue los productos indicados, según los términos acordados.",
        14,
        finalY + 15
      );
      doc.text(
        "Las modificaciones a esta orden, requieren autorización de NutriGranja S.R.L.",
        14,
        finalY + 20
      );
    } catch (pdfError) {
      console.error("Error generando contenido del PDF:", pdfError);
      throw new Error(`Error generando contenido del PDF: ${pdfError.message}`);
    }

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
