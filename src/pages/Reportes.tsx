
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, FileText, LineChart, PieChart } from "lucide-react";

const Reportes = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Sistema de Reportes</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-blue-600" />
              Reportes de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Genera reportes detallados de ventas por periodo, producto o proveedor.
            </p>
            <Button className="w-full" variant="outline">
              Generar Reporte
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <PieChart className="h-5 w-5 text-green-600" />
              Reportes de Proveedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Análisis comparativo de proveedores por calificación y volumen de compras.
            </p>
            <Button className="w-full" variant="outline">
              Generar Reporte
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <LineChart className="h-5 w-5 text-purple-600" />
              Reportes de Actividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Estadísticas de uso del sistema y actividades de los usuarios.
            </p>
            <Button className="w-full" variant="outline">
              Generar Reporte
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md mt-6 bg-white">
        <CardHeader>
          <CardTitle>Reportes Personalizados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">
            Crea reportes personalizados según tus necesidades específicas. Selecciona los filtros, 
            campos a mostrar y formato de salida.
          </p>
          <Button>Crear Reporte Personalizado</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reportes;
