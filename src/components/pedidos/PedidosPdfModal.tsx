
import React from 'react';
import { Download, Printer, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PedidosPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
}

const PedidosPdfModal: React.FC<PedidosPdfModalProps> = ({
  isOpen,
  onClose,
  pdfUrl
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Orden de Compra</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => window.open(pdfUrl || '', '_blank')}>
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
          
          <div className="flex-grow bg-gray-100 rounded-md overflow-hidden">
            {pdfUrl ? (
              <iframe 
                src={pdfUrl}
                className="w-full h-full" 
                title="PDF Viewer"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileIcon size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No se pudo cargar el PDF</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PedidosPdfModal;
