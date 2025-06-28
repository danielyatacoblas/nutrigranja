
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare, Settings, Key } from 'lucide-react';
import AssistantConfig from '@/components/assistant/AssistantConfig';

const Asistente = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-nutri-green/10">
            <Bot className="h-6 w-6 text-nutri-green" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Asistente Virtual</h1>
        </div>
        <Button 
          onClick={() => setIsConfigOpen(true)}
          className="bg-nutri-green hover:bg-nutri-green/90"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configuración
        </Button>
      </div>

      <Card className="p-6 bg-gradient-to-br from-nutri-green/10 to-nutri-cream border-none shadow-md">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-nutri-green rounded-full p-6 text-white">
            <Bot size={48} />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold text-nutri-green">Asistente NutriGranja IA</h2>
            <p className="text-gray-600 max-w-xl">
              Configura tu API key de OpenAI para activar el asistente virtual.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-orange-200 bg-orange-50">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-orange-100">
            <Key className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-800 mb-2">Configuración Requerida</h3>
            <p className="text-orange-700 text-sm mb-3">
              Necesitas configurar tu API key de OpenAI para usar el asistente.
            </p>
            <Button 
              onClick={() => setIsConfigOpen(true)}
              variant="outline" 
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex gap-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Chat Inteligente</h3>
              <p className="text-gray-600 text-sm mt-1">
                Consulta sobre el sistema y recibe respuestas precisas.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex gap-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Asistencia Contextual</h3>
              <p className="text-gray-600 text-sm mt-1">
                Ayuda con navegación y funcionalidades del sistema.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <AssistantConfig 
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
};

export default Asistente;
