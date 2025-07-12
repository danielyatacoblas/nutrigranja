import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Maximize2, Minimize2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  tokens_used?: number;
}

interface AssistantConfig {
  api_key: string;
  model: string;
  max_tokens: number;
  detail_level: string;
  tone: string;
}

const fetchAssistantConfig = async (): Promise<AssistantConfig | null> => {
  // 1. Intentar obtener la API key desde assistant_api_key
  const { data: apiKeyRows, error: apiKeyError } = await supabase
    .from("assistant_api_key")
    .select("api_key")
    .limit(1)
    .maybeSingle();

  let api_key = apiKeyRows?.api_key || null;

  // 2. Obtener configuración desde assistant_config
  const { data: configRows, error: configError } = await supabase
    .from("assistant_config")
    .select("model, max_tokens, detail_level, tone, api_key")
    .limit(1)
    .maybeSingle();

  if (!api_key && configRows?.api_key) {
    api_key = configRows.api_key;
  }

  if (!api_key) return null;

  return {
    api_key,
    model: configRows?.model || "gpt-3.5-turbo",
    max_tokens: configRows?.max_tokens || 1000,
    detail_level: configRows?.detail_level || "medium",
    tone: configRows?.tone || "professional",
  };
};

// Palabras clave de solicitudes sensibles o peligrosas
const SENSITIVE_KEYWORDS = [
  "api key",
  "apikey",
  "service role",
  "anon key",
  "token",
  "contraseña",
  "password",
  "elimina",
  "borrar",
  "borra",
  "eliminar",
  "modifica",
  "modificar",
  "actualiza",
  "actualizar",
  "cambia",
  "cambiar",
  "privado",
  "privada",
  "privacidad",
  "sensible",
  "sensitive",
];

// Palabras clave de reportes/listados permitidos
const ALLOWED_REPORTS = [
  "proveedor",
  "proveedores",
  "producto",
  "productos",
  "calificacion",
  "calificaciones",
  "pedido",
  "pedidos",
  "ranking",
  "top",
  "mejor calificado",
  "más calificado",
  "mas calificado",
  "listado",
  "reporte",
  "cantidad",
  "stock",
];

// Palabras clave de ayuda/ejemplo
const HELP_KEYWORDS = [
  "cómo ingreso",
  "como ingreso",
  "cómo insertar",
  "como insertar",
  "cómo se usa",
  "como se usa",
  "qué significa",
  "que significa",
  "ejemplo",
  "explica",
  "ayuda",
  "formulario",
  "campo",
  "dato",
];

function isSensitiveQuery(input: string): boolean {
  const lower = input.toLowerCase();
  // Solo bloquear si la consulta es acción peligrosa o pide información sensible/personal
  return (
    SENSITIVE_KEYWORDS.some((kw) => lower.includes(kw)) ||
    // Bloquear si pide datos personales de usuarios
    (lower.includes("usuario") &&
      (lower.includes("correo") ||
        lower.includes("email") ||
        lower.includes("mail") ||
        lower.includes("nombres") ||
        lower.includes("apellidos") ||
        lower.includes("telefono") ||
        lower.includes("phone") ||
        lower.includes("address") ||
        lower.includes("dirección") ||
        lower.includes("direccion") ||
        lower.includes("rol") ||
        lower.includes("roles")))
  );
}

function isAllowedReport(input: string): boolean {
  const lower = input.toLowerCase();
  return ALLOWED_REPORTS.some((kw) => lower.includes(kw));
}

function isHelpQuery(input: string): boolean {
  const lower = input.toLowerCase();
  return HELP_KEYWORDS.some((kw) => lower.includes(kw));
}

const callOpenAI = async (
  apiKey: string,
  prompt: string,
  model: string,
  max_tokens: number
): Promise<string> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "Eres el asistente de NutriGranja. Puedes responder sobre la información interna del sistema, sus módulos, datos y funcionalidades. Puedes mostrar reportes, rankings, listados y estadísticas de proveedores, productos, calificaciones y pedidos. También puedes dar ejemplos y explicaciones sobre cómo llenar formularios, qué significan los campos y cómo usar el sistema. No puedes mostrar información sensible, privada, datos personales, claves, tokens, ni realizar acciones de modificación o eliminación. Si la consulta es sensible o peligrosa, recházala educadamente.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens,
      temperature: 0.2,
    }),
  });
  const data = await response.json();
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content;
  }
  return "Lo siento, no pude procesar tu solicitud.";
};

// Tipos para minireportes
interface PedidoMini {
  id: string;
  estado: string;
  fecha_pedido: string;
  precio_total: number;
}
interface ProductoMini {
  id: string;
  nombre: string;
  tipo: string;
  precio: number;
  stock: number;
}
interface UsuarioMini {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: string;
  estado: string;
}
interface ProveedorMini {
  id: string;
  nombre: string;
  calificacion: number;
}

// Componente para la animación de tres puntitos
const TypingDots: React.FC = () => (
  <span style={{ display: "inline-flex", alignItems: "center", height: 24 }}>
    <span
      className="dot"
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "#888",
        margin: "0 2px",
        display: "inline-block",
        animation: "dotFlashing 1s infinite linear alternate",
        animationDelay: "0s",
      }}
    />
    <span
      className="dot"
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "#888",
        margin: "0 2px",
        display: "inline-block",
        animation: "dotFlashing 1s infinite linear alternate",
        animationDelay: "0.2s",
      }}
    />
    <span
      className="dot"
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "#888",
        margin: "0 2px",
        display: "inline-block",
        animation: "dotFlashing 1s infinite linear alternate",
        animationDelay: "0.4s",
      }}
    />
    <style>{`
      @keyframes dotFlashing {
        0% { opacity: 0.2; transform: translateY(0); }
        50% { opacity: 1; transform: translateY(-4px); }
        100% { opacity: 0.2; transform: translateY(0); }
      }
    `}</style>
  </span>
);

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<AssistantConfig | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "1",
          content:
            "¡Hola! Soy el Asistente Virtual de NutriGranja. ¿En qué puedo ayudarte hoy?",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && !config) {
      fetchAssistantConfig().then((cfg) => {
        setConfig(cfg);
        if (!cfg) toast.error("No se encontró la API key del asistente.");
      });
    }
  }, [isOpen, config]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isMinimized) setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendMessage = async () => {
    if (input.trim() === "" || isLoading || !config) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    // Mostrar burbuja de puntitos animados del bot
    const loadingId = `loading-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        content: "__typing__", // marcador especial
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    setLoadingMessageId(loadingId);

    const lowerInput = currentInput.toLowerCase();
    try {
      // Bloquear solicitudes sensibles
      if (isSensitiveQuery(lowerInput)) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== loadingId),
          {
            id: Date.now().toString(),
            content:
              "No puedo mostrar ni modificar información sensible, privada o realizar acciones peligrosas. Por favor, solicita solo información relevante y segura del sistema.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setLoadingMessageId(null);
        return;
      }
      // Permitir reportes y rankings de proveedores, productos, calificaciones, pedidos
      if (lowerInput.includes("reporte de pedidos")) {
        const { data, error } = await supabase
          .from("pedido")
          .select("id, estado, fecha_pedido, precio_total")
          .limit(10);
        if (error) throw new Error("Error al obtener el reporte de pedidos");
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== loadingId),
          {
            id: Date.now().toString(),
            content:
              data && data.length > 0
                ? data
                    .map(
                      (p: PedidoMini) =>
                        `Pedido #${p.id} - Estado: ${p.estado} - Fecha: ${p.fecha_pedido} - Total: $${p.precio_total}`
                    )
                    .join("\n")
                : "No hay pedidos para mostrar.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setLoadingMessageId(null);
      } else if (lowerInput.includes("reporte de productos")) {
        const { data, error } = await supabase
          .from("producto")
          .select("id, nombre, tipo, precio, stock")
          .limit(10);
        if (error) throw new Error("Error al obtener el reporte de productos");
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== loadingId),
          {
            id: Date.now().toString(),
            content:
              data && data.length > 0
                ? data
                    .map(
                      (p: ProductoMini) =>
                        `Producto: ${p.nombre} - Tipo: ${p.tipo} - Precio: $${p.precio} - Stock: ${p.stock}`
                    )
                    .join("\n")
                : "No hay productos para mostrar.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setLoadingMessageId(null);
      } else if (lowerInput.includes("reporte de usuarios")) {
        const { data, error } = await supabase
          .from("usuarios")
          .select("id, nombres, apellidos, correo, rol, estado")
          .limit(10);
        if (error) throw new Error("Error al obtener el reporte de usuarios");
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== loadingId),
          {
            id: Date.now().toString(),
            content:
              data && data.length > 0
                ? data
                    .map(
                      (u: UsuarioMini) =>
                        `Usuario: ${u.nombres} ${u.apellidos} - Correo: ${u.correo} - Rol: ${u.rol} - Estado: ${u.estado}`
                    )
                    .join("\n")
                : "No hay usuarios para mostrar.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setLoadingMessageId(null);
      } else if (
        lowerInput.includes("proveedor con mayor calificacion") ||
        lowerInput.includes("top proveedores") ||
        lowerInput.includes("ranking de proveedores") ||
        lowerInput.includes("mejor calificado")
      ) {
        // Ranking de proveedores por calificación
        const { data, error } = await supabase
          .from("proveedor")
          .select("id, nombre, calificacion")
          .order("calificacion", { ascending: false })
          .limit(5);
        if (error)
          throw new Error("Error al obtener el ranking de proveedores");
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== loadingId),
          {
            id: Date.now().toString(),
            content:
              data && data.length > 0
                ? data
                    .map(
                      (p: ProveedorMini, i: number) =>
                        `${i + 1}. ${p.nombre} (Calificación: ${
                          p.calificacion
                        })`
                    )
                    .join("\n")
                : "No hay proveedores para mostrar.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setLoadingMessageId(null);
      } else if (
        lowerInput.includes("proveedor con mas compras") ||
        lowerInput.includes("proveedor con más compras") ||
        lowerInput.includes("top proveedores por compras") ||
        lowerInput.includes("proveedor mas solicitado") ||
        lowerInput.includes("proveedor más solicitado")
      ) {
        // Ranking de proveedores por cantidad de compras
        type PedidoCompraAgg = { proveedor_id: string; count: number };
        const { data, error } = await supabase
          .from("pedido")
          .select("proveedor_id, count:count(*)")
          .order("count", { ascending: false })
          .limit(5);
        if (error)
          throw new Error(
            "Error al obtener el ranking de proveedores por compras"
          );
        // Obtener nombres de proveedores
        let proveedoresInfo: string[] = [];
        if (data && data.length > 0) {
          const proveedorIds = (data as unknown as PedidoCompraAgg[]).map(
            (d) => d.proveedor_id
          );
          const { data: proveedores, error: provError } = await supabase
            .from("proveedor")
            .select("id, nombre");
          if (provError)
            throw new Error("Error al obtener nombres de proveedores");
          proveedoresInfo = (data as unknown as PedidoCompraAgg[]).map(
            (d, i) => {
              const prov = (proveedores as unknown as ProveedorMini[]).find(
                (p) => p.id === d.proveedor_id
              );
              return `${i + 1}. ${prov ? prov.nombre : d.proveedor_id} (${
                d.count
              } compras)`;
            }
          );
        }
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== loadingId),
          {
            id: Date.now().toString(),
            content:
              proveedoresInfo.length > 0
                ? proveedoresInfo.join("\n")
                : "No hay proveedores con compras registradas.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setLoadingMessageId(null);
      } else if (isAllowedReport(lowerInput)) {
        // Si es un reporte permitido pero no está mapeado, deja que OpenAI lo explique o ayude
        const respuesta = await callOpenAI(
          config.api_key,
          currentInput,
          config.model,
          config.max_tokens
        );
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== loadingId),
          {
            id: Date.now().toString(),
            content: respuesta,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setLoadingMessageId(null);
      } else if (isHelpQuery(lowerInput)) {
        // Si es una consulta de ayuda/ejemplo, deja que OpenAI explique o dé ejemplo
        const respuesta = await callOpenAI(
          config.api_key,
          currentInput,
          config.model,
          config.max_tokens
        );
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== loadingId),
          {
            id: Date.now().toString(),
            content: respuesta,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setLoadingMessageId(null);
      } else if (
        lowerInput.includes("producto mas caro") ||
        lowerInput.includes("producto más caro") ||
        lowerInput.includes("producto de mayor precio") ||
        lowerInput.includes("producto más costoso") ||
        lowerInput.includes("producto mas costoso")
      ) {
        // Producto más caro
        const { data, error } = await supabase
          .from("producto")
          .select("id, nombre, precio")
          .order("precio", { ascending: false })
          .limit(1);
        if (error) throw new Error("Error al obtener el producto más caro");
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== loadingId),
          {
            id: Date.now().toString(),
            content:
              data && data.length > 0
                ? `El producto más caro es: ${data[0].nombre} (Precio: $${data[0].precio})`
                : "No hay productos para mostrar.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setLoadingMessageId(null);
      } else if (
        lowerInput.includes("producto con mayor calificacion") ||
        lowerInput.includes("producto mejor calificado") ||
        lowerInput.includes("producto más calificado") ||
        lowerInput.includes("producto mas calificado")
      ) {
        // Producto con mayor calificación
        const { data, error } = await supabase
          .from("producto")
          .select("id, nombre, calificacion")
          .order("calificacion", { ascending: false })
          .limit(1);
        if (error)
          throw new Error(
            "Error al obtener el producto con mayor calificación"
          );
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== loadingId),
          {
            id: Date.now().toString(),
            content:
              data && data.length > 0
                ? `El producto con mayor calificación es: ${data[0].nombre} (Calificación: ${data[0].calificacion})`
                : "No hay productos para mostrar.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setLoadingMessageId(null);
      } else if (
        (lowerInput.includes("cuantos pedidos") ||
          lowerInput.includes("cuántos pedidos") ||
          lowerInput.includes("pedidos realizados")) &&
        (lowerInput.includes("esta semana") ||
          lowerInput.includes("semana actual"))
      ) {
        // Pedidos realizados esta semana
        const now = new Date();
        const firstDayOfWeek = new Date(
          now.setDate(now.getDate() - now.getDay() + 1)
        ); // Lunes
        firstDayOfWeek.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const { count, error } = await supabase
          .from("pedido")
          .select("id", { count: "exact", head: true })
          .gte("fecha_pedido", firstDayOfWeek.toISOString())
          .lte("fecha_pedido", today.toISOString());
        if (error) throw new Error("Error al obtener los pedidos de la semana");
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== loadingId),
          {
            id: Date.now().toString(),
            content:
              typeof count === "number"
                ? `Se han realizado ${count} pedidos en la semana actual.`
                : "No hay pedidos registrados esta semana.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setLoadingMessageId(null);
      } else {
        // Si no es minireporte ni ayuda, usar OpenAI normal
        const respuesta = await callOpenAI(
          config.api_key,
          currentInput,
          config.model,
          config.max_tokens
        );
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== loadingId),
          {
            id: Date.now().toString(),
            content: respuesta,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setLoadingMessageId(null);
      }
    } catch (error: unknown) {
      let errorContent =
        "Lo siento, ocurrió un error al procesar tu solicitud.";
      if (error instanceof Error) errorContent = error.message;
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== loadingId),
        {
          id: Date.now().toString(),
          content: errorContent,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setLoadingMessageId(null);
    } finally {
      setIsLoading(false);
      setLoadingMessageId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!user) return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleChat}
          className="bg-nutri-green rounded-full p-3 shadow-lg hover:bg-nutri-green/90 transition-colors"
        >
          <Bot size={24} className="text-white" />
        </button>
        {isOpen && (
          <div
            className={`absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col transition-all duration-300 ease-in-out
              ${isMinimized ? "w-72 h-12" : "w-80 sm:w-96 h-[500px]"}`}
          >
            <div className="bg-nutri-green text-white p-3 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-medium">Asistente NutriGranja</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={toggleMinimize}
                  className="p-1 hover:bg-nutri-lightgreen/20 rounded"
                >
                  {isMinimized ? (
                    <Maximize2 size={16} />
                  ) : (
                    <Minimize2 size={16} />
                  )}
                </button>
                <button
                  onClick={toggleChat}
                  className="p-1 hover:bg-nutri-lightgreen/20 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            {!isMinimized && (
              <>
                <div className="flex-1 p-3 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-3 flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div className="flex items-start gap-2 max-w-[80%]">
                        {message.sender === "bot" && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-nutri-green text-white">
                              NG
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div
                            className={`p-3 rounded-lg ${
                              message.sender === "user"
                                ? "bg-nutri-green text-white"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content === "__typing__" ? (
                                <TypingDots />
                              ) : (
                                message.content
                              )}
                            </p>
                          </div>
                          <div className="text-xs text-gray-400 mt-1 text-right">
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-3 border-t flex gap-2 items-center">
                  <textarea
                    className="flex-1 border rounded p-2 resize-none text-sm"
                    rows={1}
                    placeholder={
                      isLoading ? "Enviando..." : "Escribe tu mensaje..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading || !config}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim() || !config}
                    className="bg-nutri-green text-white"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ChatBot;
