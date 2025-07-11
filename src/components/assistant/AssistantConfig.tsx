import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, Save, Key, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssistantConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

const GLOBAL_ASSISTANT_KEY_ID = "00000000-0000-0000-0000-000000000000";

const AssistantConfig: React.FC<AssistantConfigProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Referencias para evitar múltiples cargas
  const configLoadedRef = useRef(false);
  const loadingConfigRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  const loadConfig = useCallback(async () => {
    if (!isOpen) return;
    try {
      setInitialLoading(true);
      const { data, error } = await supabase
        .from("assistant_api_key")
        .select("api_key")
        .eq("id", GLOBAL_ASSISTANT_KEY_ID)
        .maybeSingle();
      if (error) {
        toast.error("Error al cargar la configuración");
        return;
      }
      setApiKey(data?.api_key || "");
    } catch (error) {
      toast.error("Error al cargar la configuración");
    } finally {
      setInitialLoading(false);
    }
  }, [isOpen]);

  // Solo cargar cuando el modal se abre y hay usuario
  useEffect(() => {
    if (isOpen && user?.id) {
      loadConfig();
    }
  }, [isOpen, user?.id, loadConfig]);

  // Resetear estado cuando cambia el usuario
  useEffect(() => {
    if (user?.id !== currentUserIdRef.current) {
      configLoadedRef.current = false;
      currentUserIdRef.current = user?.id || null;
      setApiKey("");
    }
  }, [user?.id]);

  const saveConfig = async () => {
    if (!isAdmin) {
      toast.error("Debes ingresar la contraseña de administrador");
      return;
    }
    if (!apiKey.trim()) {
      toast.error("La API key es requerida");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase
        .from("assistant_api_key")
        .upsert(
          {
            id: GLOBAL_ASSISTANT_KEY_ID,
            api_key: apiKey.trim(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      if (error) {
        toast.error("Error al guardar la configuración: " + error.message);
        return;
      }
      toast.success("Configuración guardada exitosamente");
      onClose();
    } catch (error) {
      toast.error("Error al guardar la configuración");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración del Asistente
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Cargando configuración...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración del Asistente
          </DialogTitle>
        </DialogHeader>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Key className="h-5 w-5" />
              API Key de OpenAI
            </CardTitle>
            <CardDescription className="text-orange-600">
              Necesaria para activar el asistente virtual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="admin_password">
                Contraseña de administrador
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="admin_password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="admin"
                  className="w-40"
                  disabled={isAdmin}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (adminPassword === "admin") {
                      setIsAdmin(true);
                      toast.success("Modo edición habilitado");
                    } else {
                      toast.error("Contraseña incorrecta");
                    }
                  }}
                  disabled={isAdmin}
                >
                  {isAdmin ? "Habilitado" : "Validar"}
                </Button>
              </div>
              <Label htmlFor="api_key">API Key</Label>
              <div className="relative">
                <Input
                  id="api_key"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                  disabled={!isAdmin}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-orange-600">
                Obtén tu API key en{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-orange-800"
                >
                  platform.openai.com/api-keys
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={saveConfig}
            disabled={loading || !apiKey.trim() || !isAdmin}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssistantConfig;
