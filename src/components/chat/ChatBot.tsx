import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Maximize2, Minimize2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AssistantConfig from "../assistant/AssistantConfig";
import { askSimpleChatbot } from "@/integrations/supabase/simple-chatbot";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  tokens_used?: number;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "1",
          content:
            "¡Hola! Soy el Asistente Virtual de NutriGranja. Puedo ayudarte con:\n\n• Generar reportes del sistema\n• Buscar proveedores de materiales\n• Explicar funcionalidades\n• Navegación y uso del sistema\n\n¿En qué puedo ayudarte hoy?",
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

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isMinimized) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendMessage = async () => {
    if (input.trim() === "" || isLoading) return;

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

    try {
      // Llamada directa al chatbot simple (sin auth)
      const respuesta = await askSimpleChatbot(currentInput);
      const botMessage: Message = {
        id: Date.now().toString(),
        content: respuesta || "Lo siento, no pude procesar tu solicitud.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling assistant:", error);
      let errorContent =
        "Lo siento, ocurrió un error al procesar tu solicitud.";
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorContent =
            "Necesitas configurar tu API key de OpenAI. Contacta al administrador.";
        }
      }
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: errorContent,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Error al comunicarse con el asistente");
    } finally {
      setIsLoading(false);
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

  if (!user) {
    return null;
  }

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
                  onClick={() => setIsConfigOpen(true)}
                  className="p-1 hover:bg-nutri-lightgreen/20 rounded"
                  title="Configuración"
                >
                  <Settings size={16} />
                </button>
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
                              {message.content}
                            </p>
                            {message.tokens_used && (
                              <p className="text-xs mt-1 opacity-70">
                                Tokens: {message.tokens_used}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 ml-1">
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                        {message.sender === "user" && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gray-500 text-white">
                              {user?.email?.[0].toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start mb-3">
                      <div className="flex items-start gap-2 max-w-[80%]">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-nutri-green text-white">
                            NG
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Pregunta sobre el sistema o proveedores..."
                      className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-nutri-green"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-nutri-green hover:bg-nutri-green/90 p-2"
                      size="icon"
                      disabled={isLoading || !input.trim()}
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <AssistantConfig
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </>
  );
};

export default ChatBot;
