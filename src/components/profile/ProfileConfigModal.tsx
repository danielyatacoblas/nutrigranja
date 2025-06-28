import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Settings, Save, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const ProfileConfigModal: React.FC<ProfileConfigModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [userInfo, setUserInfo] = useState({
    usuario: "",
    nombres: "",
    apellidos: "",
    correo: "",
    dni: "",
    telefono: "",
    rol: "",
  });

  const [systemInfo] = useState({
    version: "1.0.0",
    company: "NutriGranja S.R.L.",
    ruc: "2072814901",
    manager: "Alder Flores Nick",
    plan: "Profesional",
    lastUpdate: "29/05/2025",
  });

  // Load user data only when modal opens and we have userProfile
  useEffect(() => {
    if (isOpen && userProfile && !dataLoaded) {
      console.log("ProfileModal - Loading user data:", userProfile);
      setUserInfo({
        usuario: userProfile.usuario || "",
        nombres: userProfile.nombres || "",
        apellidos: userProfile.apellidos || "",
        correo: userProfile.correo || user?.email || "",
        dni: userProfile.dni || "",
        telefono: userProfile.telefono || "",
        rol: userProfile.rol || "",
      });
      setDataLoaded(true);
    } else if (!isOpen) {
      // Reset when modal closes
      setDataLoaded(false);
    }
  }, [isOpen, userProfile, user?.email, dataLoaded]);

  const handleInputChange = (field: string, value: string) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDniChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 8) {
      handleInputChange("dni", numericValue);
    }
  };

  const handleTelefonoChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 9) {
      handleInputChange("telefono", numericValue);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("usuarios")
        .update({
          usuario: userInfo.usuario,
          nombres: userInfo.nombres,
          apellidos: userInfo.apellidos,
          dni: userInfo.dni,
          telefono: userInfo.telefono,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Refresh user profile in context
      await refreshUserProfile();

      toast.success("Información actualizada correctamente");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating user info:", error);
      toast.error("Error al actualizar la información");
    } finally {
      setLoading(false);
    }
  };

  // Show loading only if modal is open and we don't have user profile data
  if (isOpen && (!userProfile || !dataLoaded)) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Perfil
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">
                Cargando información del usuario...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Perfil
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="usuario" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="usuario" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Usuario
            </TabsTrigger>
            <TabsTrigger value="sistema" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usuario" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu información personal. No puedes cambiar tu
                  contraseña desde aquí.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="usuario">Usuario</Label>
                    <Input
                      id="usuario"
                      value={userInfo.usuario}
                      onChange={(e) =>
                        handleInputChange("usuario", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="correo">Correo Electrónico</Label>
                    <Input
                      id="correo"
                      type="email"
                      value={userInfo.correo}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombres">Nombres</Label>
                    <Input
                      id="nombres"
                      value={userInfo.nombres}
                      onChange={(e) =>
                        handleInputChange("nombres", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellidos">Apellidos</Label>
                    <Input
                      id="apellidos"
                      value={userInfo.apellidos}
                      onChange={(e) =>
                        handleInputChange("apellidos", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dni">DNI (máx. 8 dígitos)</Label>
                    <Input
                      id="dni"
                      value={userInfo.dni}
                      onChange={(e) => handleDniChange(e.target.value)}
                      placeholder="12345678"
                      maxLength={8}
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono (máx. 9 dígitos)</Label>
                    <Input
                      id="telefono"
                      value={userInfo.telefono}
                      onChange={(e) => handleTelefonoChange(e.target.value)}
                      placeholder="987654321"
                      maxLength={9}
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="rol">Rol</Label>
                  <Input
                    id="rol"
                    value={
                      userInfo.rol === "admin" ? "Administrador" : "Usuario"
                    }
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sistema" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información del Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Versión</Label>
                    <Input
                      value={systemInfo.version}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label>Plan</Label>
                    <Input
                      value={systemInfo.plan}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Empresa</Label>
                    <Input
                      value={systemInfo.company}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label>RUC</Label>
                    <Input
                      value={systemInfo.ruc}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Gerente</Label>
                    <Input
                      value={systemInfo.manager}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label>Última Actualización</Label>
                    <Input
                      value={systemInfo.lastUpdate}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileConfigModal;
